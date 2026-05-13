import type { RequestContext } from '@bunito/bun/internals';
import { ServerRouter } from '@bunito/bun/internals';
import type { CallableInstance, Class, MaybePromise, RawObject } from '@bunito/common';
import { InternalException, isFn, isObject } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Container } from '@bunito/container';
import type { MatchedControllers } from '@bunito/container/internals';
import { Logger } from '@bunito/logger';
import type { ZodType } from 'zod';
import { HTTP_CONTROLLER_KEY } from './constants';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  ValidationFailedException,
} from './exceptions';
import { HTTPConfig } from './http-config';
import type { HTTPException } from './http-exception';
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
  HTTPContext,
  HTTPPath,
  RouteDefinition,
  RouteMethod,
} from './types';
import { normalizePath, normalizeQuery } from './utils';

@ServerRouter({
  injects: [
    HTTPConfig,
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
    private readonly config: ResolveConfig<typeof HTTPConfig>,
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
          InternalException.throw`${instance} is not a valid Middleware`;
          return;
        }

        this.middleware.set(instance.constructor as Class, instance);
      }
    }

    this.buildRoutes(container.locateComponents(HTTP_CONTROLLER_KEY));
  }

  getRoutePaths(): string[] {
    return [...this.routes.keys()];
  }

  async processRequest(
    request: Request,
    requestContext: RequestContext,
  ): Promise<Response | undefined> {
    const { defaultResponseContentType } = this.config;
    const { route: requestRoute } = requestContext;

    if (!requestRoute) {
      return new NotFoundException().toResponse(defaultResponseContentType);
    }

    const { path, method, params } = requestRoute;

    const routes = this.routes.get(path);

    const route = routes?.get(method) ?? routes?.get('ALL');

    if (!route) {
      return new NotImplementedException().toResponse(defaultResponseContentType);
    }

    const logger = await this.container.tryResolveProvider(Logger);

    logger?.setContext(HTTPRouter);

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
          moduleId,
        });

        if (controller[propKey]) {
          const args = injects
            ? await this.container.resolveInjections(injects, {
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
        logger?.warn(exception.cause);
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
          logger?.warn(exception.cause);
        }
      }
    }

    if (exception) {
      response = exception.toResponse(defaultResponseContentType);
    }

    return response;
  }

  private buildRoutes(
    matchedControllers:
      | MatchedControllers<ControllerClassOptions, ControllerMethodOptions>
      | undefined,
    parentPrefix?: HTTPPath,
    parentMiddleware?: MiddlewareHandlers,
  ) {
    if (!matchedControllers) {
      return;
    }

    const { moduleId, controllers, props, children } = matchedControllers;

    let rootPrefix = parentPrefix;

    const rootMiddleware = cloneMiddlewareHandlers(parentMiddleware);

    if (props) {
      for (const prop of props) {
        if (prop.propKind !== 'class') {
          continue;
        }

        const { options } = prop;

        if (options.kind === 'prefix') {
          rootPrefix = normalizePath(rootPrefix, options.prefix);
        } else if (options.kind === 'middleware') {
          const { options: opts, middleware } = options;

          const instance = this.middleware.get(middleware);

          if (!instance) {
            return InternalException.throw`Middleware ${middleware} is not available in the container`;
          }

          pushMiddlewareHandlers(rootMiddleware, instance, opts);
        }
      }
    }

    if (controllers) {
      for (const { providerId, options, props } of controllers) {
        let prefix = options.prefix
          ? normalizePath(rootPrefix, `/${options.prefix}`)
          : rootPrefix;

        const controller: ControllerDefinition = {
          moduleId,
          providerId,
          middleware: cloneMiddlewareHandlers(rootMiddleware),
        };

        for (const prop of props) {
          if (prop.propKind !== 'class') {
            continue;
          }

          const { options } = prop;

          if (options.kind === 'prefix') {
            prefix = normalizePath(prefix, options.prefix);
          } else if (options.kind === 'middleware') {
            const { options: opts, middleware } = options;

            const instance = this.middleware.get(middleware);

            if (!instance) {
              return InternalException.throw`Middleware ${middleware} is not available in the container`;
            }

            pushMiddlewareHandlers(controller.middleware, instance, opts);
          }
        }

        let hasRoutes = false;

        for (const prop of props) {
          if (prop.propKind !== 'method' || prop.options.kind !== 'route') {
            continue;
          }

          hasRoutes = true;

          const { options } = prop.options;
          const { propKey } = prop;
          const { method, injects } = options;
          const path = normalizePath(prefix, options.path);

          const routes = this.routes.getOrInsertComputed(path, () => new Map());

          if (routes.has(method)) {
            return InternalException.throw`Duplicate route ${method} ${path} detected in ${providerId}#${propKey}`;
          }

          routes.set(method, {
            controller,
            propKey,
            injects,
          });
        }

        if (!hasRoutes) {
          return InternalException.throw`Controller ${providerId} does not declare any routes`;
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
