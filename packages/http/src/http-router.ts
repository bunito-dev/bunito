import type { RequestContext } from '@bunito/bun/internals';
import { ServerRouter } from '@bunito/bun/internals';
import type { CallableInstance, Class, MaybePromise, RawObject } from '@bunito/common';
import { isFn, isObject } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Container } from '@bunito/container';
import type { MatchedComponents } from '@bunito/container/internals';
import { Id } from '@bunito/container/internals';
import { Logger } from '@bunito/logger';
import type { ZodType } from 'zod';
import { Controller } from './decorators';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  ValidationFailedException,
} from './exceptions';
import type { HTTPException } from './http.exception';
import { HTTPRouterConfig } from './http-router.config';
import { HTTPRouterException } from './http-router.exception';
import { Body, Context, Method, Params, Query } from './injections';
import type { MiddlewareContext, MiddlewareHandlers } from './middleware';
import {
  cloneMiddlewareHandlers,
  Middleware,
  pushMiddlewareHandlers,
} from './middleware';
import type {
  ControllerClassOptions,
  ControllerDefinition,
  ControllerMethodOptions,
  ControllerOptions,
  HTTPContext,
  HTTPPath,
  RouteDefinition,
  RouteMethod,
} from './types';
import { normalizePath, normalizeQuery } from './utils';

@ServerRouter({
  injects: [
    HTTPRouterConfig,
    Container,
    {
      useToken: Middleware,
      optional: true,
    },
  ],
})
export class HTTPRouter implements ServerRouter {
  private readonly routes = new Map<string, Map<RouteMethod, RouteDefinition>>();

  private readonly middleware = new Map<Class, Middleware>();

  constructor(
    private readonly config: ResolveConfig<typeof HTTPRouterConfig>,
    private readonly container: Container,
    middleware: Middleware<RawObject>[] | null = null,
  ) {
    if (middleware) {
      for (const instance of middleware) {
        let isMiddleware = false;

        if (isFn(instance.beforeRequest)) {
          instance.beforeRequest = instance.beforeRequest.bind(instance);
          isMiddleware = true;
        }

        if (isFn(instance.serializeResponseData)) {
          instance.serializeResponseData = instance.serializeResponseData.bind(instance);
          isMiddleware = true;
        }

        if (isFn(instance.serializeException)) {
          instance.serializeException = instance.serializeException.bind(instance);
          isMiddleware = true;
        }

        if (!isMiddleware) {
          HTTPRouterException.throw`${instance} is not a valid Middleware`;
          return;
        }

        this.middleware.set(instance.constructor as Class, instance);
      }
    }

    this.buildRoutes(container.locateComponents(Controller));
  }

  getRoutePaths(): string[] {
    return [...this.routes.keys()];
  }

  async processRequest(
    request: Request,
    requestContext: RequestContext,
  ): Promise<Response | undefined> {
    const { responseContentType } = this.config;
    const { route: requestRoute } = requestContext;

    if (!requestRoute) {
      return new NotFoundException().toResponse(responseContentType);
    }

    const { path, method, params } = requestRoute;

    const routes = this.routes.get(path);
    const route = routes?.get(method) ?? routes?.get('ALL');

    if (!route) {
      return new NotImplementedException().toResponse(responseContentType);
    }

    const requestId = Id.unique('HTTPRequest');

    const logger = await this.container.tryResolveProvider(Logger, {
      requestId,
    });

    logger?.setContext(requestId);

    const trace = logger?.trace();

    const {
      controller: { providerId, moduleId, middleware },
      propKey,
      injects,
    } = route;

    let response: Response | undefined;
    let responseData: unknown;
    let exception: HTTPException | undefined;

    const url = new URL(request.url);
    const query = normalizeQuery(url.searchParams);

    const context: HTTPContext = {
      request,
      url,
      params,
      query,
      body: null,
    };

    try {
      if (middleware?.beforeRequest) {
        for (const { handler, options } of middleware.beforeRequest) {
          const middlewareContext: MiddlewareContext = {
            ...context,
            ...options,
          };

          responseData = await handler(middlewareContext);

          if (responseData !== undefined) {
            break;
          }

          context.body = middlewareContext.body;
        }
      }

      if (responseData === undefined) {
        const controller = await this.container.resolveProvider<
          CallableInstance<MaybePromise<unknown>>
        >(providerId, {
          requestId,
          moduleId,
        });

        if (controller[propKey]) {
          const args = injects
            ? await this.container.resolveInjections(injects, {
                requestId,
                moduleId,
                injectionResolver: async (token, options) => {
                  let result: unknown = null;
                  let path: string | undefined;

                  switch (token) {
                    case Context:
                      result = context;
                      break;

                    case Params:
                      result = context.params;
                      path = 'params';
                      break;

                    case Query:
                      result = context.query;
                      path = 'query';
                      break;

                    case Body:
                      result = context.body;
                      path = 'body';
                      break;

                    case Method:
                      result = context.request.method;
                      break;

                    case URL:
                      result = url;
                      break;

                    case Request:
                      return request;

                    case Headers:
                      return request.headers;
                  }

                  if (path && isObject<ZodType>(options) && 'safeParse' in options) {
                    const parsed = await options.safeParseAsync(result);

                    if (parsed.success) {
                      result = parsed.data;
                    } else {
                      const { error } = parsed;

                      for (const issue of error.issues) {
                        issue.path.unshift(path);
                      }

                      throw error;
                    }
                  }

                  return result;
                },
              })
            : [];

          responseData = await controller[propKey](...args);
        }
      }

      if (responseData instanceof Response) {
        response = responseData;
        responseData = undefined;
      }

      if (responseData !== undefined && middleware?.serializeResponseData) {
        for (const { handler, options } of middleware.serializeResponseData) {
          response = await handler(responseData, {
            ...context,
            ...options,
          });

          if (response instanceof Response) {
            responseData = undefined;
            break;
          }
        }
      }

      if (responseData) {
        exception = new BadRequestException();
      } else if (!response) {
        exception = new NotFoundException();
      }
    } catch (err) {
      exception = InternalServerErrorException.capture(
        ValidationFailedException.capture(err),
      );
    }

    if (exception) {
      if (exception.cause) {
        trace?.warn(exception.cause);
      }

      try {
        if (middleware?.serializeException) {
          for (const { handler, options } of middleware.serializeException) {
            response = await handler(exception, {
              ...context,
              ...options,
            });

            if (response instanceof Response) {
              exception = undefined;
              break;
            }
          }
        }
      } catch (err) {
        exception = InternalServerErrorException.capture(
          ValidationFailedException.capture(err),
        );

        if (exception.cause) {
          trace?.warn(exception.cause);
        }
      }
    }

    if (exception) {
      response = exception.toResponse(responseContentType);
    }

    const status = response?.status;

    trace?.debug(`${method} ${path}${status ? ` ${status}` : ''}`, {
      params,
      query,
    });

    await this.container.destroyRequest(requestId);

    return response;
  }

  private buildRoutes(
    matchedComponents:
      | MatchedComponents<
          ControllerOptions,
          {
            class: ControllerClassOptions;
            method: ControllerMethodOptions;
          }
        >
      | undefined,
    parentPrefix?: HTTPPath,
    parentMiddleware?: MiddlewareHandlers,
  ) {
    if (!matchedComponents) {
      return;
    }

    const { moduleId, components, children } = matchedComponents;

    let rootPrefix = parentPrefix;

    const rootMiddleware = cloneMiddlewareHandlers(parentMiddleware);

    if (components) {
      for (const component of components) {
        const {
          options: { value: options, props = [] },
        } = component;

        if ('useClass' in component) {
          for (const prop of props) {
            if (prop.propKind === 'class') {
              const { value } = prop;

              switch (value.kind) {
                case 'prefix': {
                  rootPrefix = normalizePath(rootPrefix, value.prefix);
                  break;
                }

                case 'middleware': {
                  const instance = this.middleware.get(value.middleware);
                  const { options } = value;

                  if (!instance) {
                    return HTTPRouterException.throw`Middleware ${value.middleware} is not available in the container`;
                  }

                  pushMiddlewareHandlers(rootMiddleware, instance, options);
                  break;
                }
              }
            }
          }
        } else if ('useProvider' in component) {
          const { useProvider: providerId } = component;

          if (!options) {
            return HTTPRouterException.throw`${providerId} is not a valid Controller`;
          }

          const controller: ControllerDefinition = {
            moduleId,
            providerId,
            middleware: cloneMiddlewareHandlers(rootMiddleware),
          };

          let prefix = normalizePath(rootPrefix, options.prefix);

          for (const prop of props) {
            if (prop.propKind === 'class') {
              const { value } = prop;

              switch (value.kind) {
                case 'prefix': {
                  prefix = normalizePath(prefix, value.prefix);
                  break;
                }

                case 'middleware': {
                  const instance = this.middleware.get(value.middleware);
                  const { options } = value;

                  if (!instance) {
                    return HTTPRouterException.throw`Middleware ${value.middleware} is not available in the container`;
                  }

                  pushMiddlewareHandlers(controller.middleware, instance, options);

                  break;
                }
              }
            }
          }

          let hasRoutes = false;

          for (const prop of props) {
            if (prop.propKind !== 'method' || prop.value.kind !== 'route') {
              continue;
            }

            hasRoutes = true;

            const { options } = prop.value;
            const { propKey } = prop;
            const { method, injects } = options;
            const path = normalizePath(prefix, options.path);

            const routes = this.routes.getOrInsertComputed(path, () => new Map());

            if (routes.has(method)) {
              return HTTPRouterException.throw`Duplicate route ${method} ${path} detected in ${providerId}#${propKey}`;
            }

            routes.set(method, {
              controller,
              propKey,
              injects,
            });
          }

          if (!hasRoutes) {
            return HTTPRouterException.throw`Controller ${providerId} does not declare any routes`;
          }
        }
      }
    }

    if (children) {
      for (const child of children) {
        this.buildRoutes(child, rootPrefix, rootMiddleware);
      }
    }
  }
}
