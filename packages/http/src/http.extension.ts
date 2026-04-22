import type { CallableInstance } from '@bunito/common';
import { ConfigurationException, isFn, isObject } from '@bunito/common';
import type { ModuleId, ProviderId } from '@bunito/container';
import { Container, Id, OnInit, PARENT_MODULE_IDS } from '@bunito/container';
import type {
  HttpMethod,
  HttpPath,
  RequestContext,
  ServerRouteOptions,
} from '@bunito/server';
import { HttpException, ServerExtension } from '@bunito/server';
import type { ZodType } from 'zod';
import { CONTROLLER_COMPONENT, MIDDLEWARE_EXTENSION } from './constants';
import { NotFoundException } from './exceptions';
import { Params, Query } from './injections';
import type { Middleware } from './middleware';
import type {
  ControllerOptions,
  RouteDefinition,
  RouteMiddleware,
  RouteOptions,
} from './types';
import { normalizePath } from './utils';

@ServerExtension({
  injects: [Container, PARENT_MODULE_IDS],
})
export class HttpExtension implements ServerExtension {
  private readonly routes: Map<HttpPath, Map<HttpMethod | null, RouteDefinition[]>> =
    new Map();

  private readonly middleware = new Map<ProviderId, Middleware>();

  constructor(
    private readonly container: Container,
    private readonly parentModuleIds: Set<ModuleId>,
  ) {}

  @OnInit()
  async configure(): Promise<void> {
    for (const { providerId, moduleId } of this.container.getExtensions(
      MIDDLEWARE_EXTENSION,
    )) {
      const middleware = await this.container.resolveProvider<Middleware>(providerId, {
        moduleId,
      });

      if (
        !isObject(middleware) ||
        (!isFn(middleware.beforeRequest) &&
          !isFn(middleware.serializeResponseData) &&
          !isFn(middleware.serializeException))
      ) {
        return ConfigurationException.throw`${middleware} is not a valid Middleware`;
      }

      if (isFn(middleware.beforeRequest)) {
        middleware.beforeRequest = middleware.beforeRequest.bind(middleware);
      }
      if (isFn(middleware.serializeResponseData)) {
        middleware.serializeResponseData =
          middleware.serializeResponseData.bind(middleware);
      }
      if (isFn(middleware.serializeException)) {
        middleware.serializeException = middleware.serializeException.bind(middleware);
      }

      this.middleware.set(providerId, middleware);
    }

    for (const moduleId of this.parentModuleIds) {
      const controllers = this.container.getComponents<
        ControllerOptions,
        unknown,
        RouteOptions
      >(CONTROLLER_COMPONENT, moduleId);

      for (const controller of controllers) {
        if (!('useProviderId' in controller)) {
          continue;
        }

        const { moduleId, useProviderId: providerId, options, props } = controller;

        const prefixes: HttpPath[] = [];
        const middlewareIds = new Set<ProviderId>();
        const parentMiddleware: RouteMiddleware = {
          serializeResponseData: [],
          serializeException: [],
          beforeRequest: [],
        };

        for (const { prefix, middleware } of options) {
          if (prefix) {
            prefixes.push(normalizePath(prefix));
          }

          if (middleware) {
            for (const middlewareClass of middleware) {
              const middlewareId = Id.for(middlewareClass);
              if (!middlewareIds.has(middlewareId)) {
                const instance = this.middleware.get(middlewareId);

                if (!instance) {
                  continue;
                }

                if (instance.beforeRequest) {
                  parentMiddleware.beforeRequest.push(instance.beforeRequest);
                }
                if (instance.serializeResponseData) {
                  parentMiddleware.serializeResponseData.push(
                    instance.serializeResponseData,
                  );
                }
                if (instance.serializeException) {
                  parentMiddleware.serializeException.push(instance.serializeException);
                }
              }
            }
          }
        }

        for (const prop of props) {
          if (prop.kind !== 'method') {
            continue;
          }

          const middleware: RouteMiddleware = {
            serializeResponseData: [...parentMiddleware.serializeResponseData],
            serializeException: [...parentMiddleware.serializeException],
            beforeRequest: [...parentMiddleware.beforeRequest],
          };

          const {
            propKey,
            options: { path, method, uses, injects },
          } = prop;

          if (uses) {
            for (const middlewareClass of uses) {
              const middlewareId = Id.for(middlewareClass);
              if (!middlewareIds.has(middlewareId)) {
                const instance = this.middleware.get(middlewareId);

                if (!instance) {
                  continue;
                }

                if (instance.beforeRequest) {
                  middleware.beforeRequest.push(instance.beforeRequest);
                }
                if (instance.serializeResponseData) {
                  middleware.serializeResponseData.push(instance.serializeResponseData);
                }
                if (instance.serializeException) {
                  middleware.serializeException.push(instance.serializeException);
                }
              }
            }
          }

          const normalizedPath = normalizePath(...prefixes, path);

          this.routes
            .getOrInsertComputed(normalizedPath, () => new Map())
            .getOrInsertComputed(method ?? null, () => [])
            .push({
              middleware,
              moduleId,
              propKey,
              providerId,
              injects,
            });
        }
      }
    }
  }

  getRoutes(): ServerRouteOptions[] {
    const routes: ServerRouteOptions[] = [];

    for (const [path, methods] of this.routes.entries()) {
      for (const method of methods.keys()) {
        routes.push({
          path,
          method,
        });
      }
    }

    return routes;
  }

  async processRequest(
    request: Request,
    context: RequestContext,
  ): Promise<Response | null> {
    let response: Response | null | undefined;

    const { requestId } = context;

    if (context.path) {
      const routes = this.routes.get(context.path)?.get(context.method);

      if (routes) {
        for (const { providerId, moduleId, middleware, propKey, injects } of routes) {
          let exception: HttpException | undefined;

          try {
            if (middleware.beforeRequest.length) {
              for (const beforeRequest of middleware.beforeRequest) {
                await beforeRequest(context);
              }
            }

            const controller = await this.container.resolveProvider<CallableInstance>(
              providerId,
              {
                requestId,
                moduleId,
              },
            );

            if (!controller[propKey]) {
              continue;
            }

            const args: unknown[] = [];

            if (!injects) {
              args.push(context);
            } else {
              for (const inject of injects) {
                let token: unknown;
                let schema: ZodType | undefined;

                if (isObject(inject) && 'token' in inject && 'schema' in inject) {
                  token = inject.token;
                  schema = inject.schema as ZodType;
                } else {
                  token = inject;
                }

                let arg: unknown = null;

                switch (token) {
                  case Request:
                    arg = request;
                    break;

                  case Headers:
                    arg = request.headers;
                    break;

                  case URL:
                    arg = context.url;
                    break;

                  case Params:
                    arg = context.params;
                    break;

                  case Query:
                    arg = context.query;
                    break;
                }

                if (schema) {
                  const result = schema.safeParse(arg);

                  if (result.success) {
                    arg = result.data;
                  }
                }

                args.push(arg);
              }
            }

            const result = await controller[propKey](...args);

            if (result === null || result instanceof Response) {
              response = result;
              break;
            }

            if (result !== undefined) {
              if (middleware.serializeResponseData.length) {
                for (const serializeResponseData of middleware.serializeResponseData) {
                  response = await serializeResponseData(result, context);

                  if (response instanceof Response) {
                    break;
                  }

                  response = undefined;
                }
              } else {
                exception = new HttpException('NOT_IMPLEMENTED');
              }
            }
          } catch (err) {
            exception = new HttpException(
              'INTERNAL_SERVER_ERROR',
              undefined,
              undefined,
              err,
            );
          }

          if (exception) {
            if (middleware.serializeException.length) {
              for (const serializeException of middleware.serializeException) {
                response = await serializeException(exception, context);

                if (response instanceof Response) {
                  break;
                }

                response = undefined;
              }
            } else {
              throw exception;
            }
          }
        }
      }
    }

    if (response === undefined) {
      throw new NotFoundException();
    }

    return response;
  }
}
