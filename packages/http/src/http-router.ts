import type { HTTPMethod, RequestContext } from '@bunito/bun/internals';
import { ServerRouter } from '@bunito/bun/internals';
import type { CallableInstance, Class, MaybePromise, RawObject } from '@bunito/common';
import { InternalException, isFn, isNumber, isObject } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { MatchedControllers } from '@bunito/container';
import { Container } from '@bunito/container';
import { Logger } from '@bunito/logger';
import type { ZodType } from 'zod';
import {
  HTTP_ALL_METHODS,
  HTTP_CONTROLLER_KEY,
  HTTP_SUCCESS_STATUS_CODES,
} from './constants';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  ValidationFailedException,
} from './exceptions';
import { HTTPConfig } from './http-config';
import type { HTTPException } from './http-exception';
import { Body, Context, CustomInjection, Method, Params, Query } from './injections';
import type { MiddlewareContext, MiddlewareHandlers } from './middleware';
import { Middleware } from './middleware';
import type {
  CORSOptions,
  ControllerClassOptions,
  ControllerDefinition,
  ControllerMethodOptions,
  HTTPContext,
  HTTPPath,
  RouteDefinition,
  RouteMethod,
} from './types';
import {
  cloneMiddlewareHandlers,
  mergeCorsOptions,
  normalizePath,
  normalizeQuery,
  pushMiddlewareHandlers,
} from './utils';

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
  private readonly routes = new Map<
    string,
    {
      corsOptions?: CORSOptions;
      corsHeaders?: Headers;
      headers: Headers;
      definitions: Map<RouteMethod, RouteDefinition>;
    }
  >();

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

        if (isFn(instance.beforeResponse)) {
          instance.beforeRequest = instance.beforeResponse.bind(instance);
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
    this.prepareRouteHeaders();
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

    const routes = requestRoute ? this.routes.get(requestRoute.path) : undefined;

    if (!routes || !requestRoute) {
      return new NotFoundException().toResponse(defaultResponseContentType);
    }

    const { method, params } = requestRoute;

    if (method === 'OPTIONS') {
      const { headers } = routes;

      return new Response(null, {
        status: HTTP_SUCCESS_STATUS_CODES.NO_CONTENT,
        headers: headers,
      });
    }

    const route = routes?.definitions?.get(method) ?? routes?.definitions?.get('ALL');

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
      data: {},
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

                    case CustomInjection: {
                      if (isFn(options)) {
                        return options(context);
                      }
                      break;
                    }
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

    if (response) {
      if (middleware?.beforeResponse) {
        try {
          if (middleware?.beforeResponse) {
            for (const { handler, options } of middleware.beforeResponse) {
              const output = await handler(response, {
                ...context,
                ...options,
              });

              if (output instanceof Response) {
                response = output;
              }
            }
          }
        } catch (err) {
          logger?.warn(err);
        }
      }

      if (routes.corsHeaders) {
        for (const [key, value] of routes.corsHeaders) {
          response.headers.set(key, value);
        }
      }
    }

    return response;
  }

  private buildRoutes(
    matchedControllers:
      | MatchedControllers<ControllerClassOptions, ControllerMethodOptions>
      | undefined,
    parentPrefix?: HTTPPath,
    parentCORSOptions?: CORSOptions,
    parentMiddleware?: MiddlewareHandlers,
  ) {
    if (!matchedControllers) {
      return;
    }

    const { moduleId, controllers, props, children } = matchedControllers;

    let rootPrefix = parentPrefix;
    let rootCORSOptions = parentCORSOptions;

    const rootMiddleware = cloneMiddlewareHandlers(parentMiddleware);

    if (props) {
      for (const prop of props) {
        if (prop.propKind !== 'class') {
          continue;
        }

        const { options } = prop;

        switch (options.kind) {
          case 'prefix':
            rootPrefix = normalizePath(rootPrefix, options.prefix);
            break;

          case 'cors':
            rootCORSOptions = mergeCorsOptions(rootCORSOptions, options.options);
            break;

          case 'middleware': {
            const { options: opts, middleware } = options;

            const instance = this.middleware.get(middleware);

            if (!instance) {
              return InternalException.throw`Middleware ${middleware} is not available in the container`;
            }

            pushMiddlewareHandlers(rootMiddleware, instance, opts);
            break;
          }
        }
      }
    }

    if (controllers) {
      for (const { providerId, options, props } of controllers) {
        let prefix = options.prefix
          ? normalizePath(rootPrefix, `/${options.prefix}`)
          : rootPrefix;
        let corsOptions = rootCORSOptions;

        const controller: ControllerDefinition = {
          moduleId,
          providerId,
          middleware: cloneMiddlewareHandlers(rootMiddleware),
        };

        for (const prop of props) {
          switch (prop.propKind) {
            case 'class': {
              const { options } = prop;

              switch (options.kind) {
                case 'prefix':
                  prefix = normalizePath(prefix, options.prefix);
                  break;

                case 'cors':
                  corsOptions = mergeCorsOptions(corsOptions, options.options);
                  break;

                case 'middleware': {
                  const { options: opts, middleware } = options;

                  const instance = this.middleware.get(middleware);

                  if (!instance) {
                    return InternalException.throw`Middleware ${middleware} is not available in the container`;
                  }

                  pushMiddlewareHandlers(controller.middleware, instance, opts);
                  break;
                }
              }
              break;
            }
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
          const routes = this.routes.getOrInsertComputed(path, () => ({
            headers: new Headers(),
            definitions: new Map(),
          }));

          if (routes.definitions.has(method)) {
            return InternalException.throw`Duplicate route ${method} ${path} detected in ${providerId}#${propKey}`;
          }

          routes.corsOptions = mergeCorsOptions(routes.corsOptions, corsOptions);
          routes.definitions.set(method, {
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
        this.buildRoutes(child, rootPrefix, rootCORSOptions, rootMiddleware);
      }
    }
  }

  private prepareRouteHeaders(): void {
    for (const routes of this.routes.values()) {
      const { headers, definitions, corsOptions } = routes;

      const allowedMethods = new Set(
        definitions.has('ALL')
          ? HTTP_ALL_METHODS
          : ([...definitions.keys()] as HTTPMethod[]),
      );

      headers.set('Accept', [...allowedMethods].join(', '));

      if (!corsOptions) {
        continue;
      }

      const corsMethods = corsOptions.methods?.length
        ? [...new Set(corsOptions.methods.filter((method) => allowedMethods.has(method)))]
        : [...allowedMethods];

      if (!corsMethods.length) {
        continue;
      }

      routes.corsHeaders = new Headers();

      const { corsHeaders } = routes;

      corsHeaders.set('Access-Control-Allow-Origin', corsOptions.origin ?? '*');
      corsHeaders.set(
        'Access-Control-Allow-Credentials',
        corsOptions.credentials === false ? 'false' : 'true',
      );
      corsHeaders.set('Vary', 'Origin');

      for (const [key, value] of corsHeaders) {
        headers.set(key, value);
      }

      headers.set('Access-Control-Allow-Methods', corsMethods.join(', '));
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (corsOptions.allowedHeaders?.length) {
        headers.append(
          'Access-Control-Allow-Headers',
          corsOptions.allowedHeaders.join(', '),
        );
      }

      if (isNumber(corsOptions.maxAge)) {
        headers.set('Access-Control-Max-Age', corsOptions.maxAge.toString(10));
      }
    }
  }
}
