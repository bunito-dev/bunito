import type { CallableInstance } from '@bunito/common';
import { ConfigurationException, isFn, isObject } from '@bunito/common';
import type { ModuleId, ProviderId } from '@bunito/container';
import { Container, Id, OnInit, PARENT_MODULE_IDS } from '@bunito/container';
import type { HttpMethod, HttpPath, ServerRouteOptions } from '@bunito/server/internals';
import { HttpException, RequestContext, ServerExtension } from '@bunito/server/internals';
import type { ZodError, ZodType } from 'zod';
import { CONTROLLER_COMPONENT, MIDDLEWARE_EXTENSION } from './constants';
import {
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  ValidationFailedException,
} from './exceptions';
import { Body, Params, Query } from './injections';
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

        const parentPaths: HttpPath[] = [];
        const parentMiddleware: RouteMiddleware = {
          beforeRequest: [],
          serializeResponseData: [],
          serializeException: [],
        };

        for (const opts of options) {
          switch (opts.kind) {
            case 'prefix': {
              parentPaths.push(opts.prefix);
              break;
            }

            case 'middleware': {
              const middlewareId = Id.for(opts.middleware);
              const middleware = this.middleware.get(middlewareId);

              if (!middleware) {
                return ConfigurationException.throw`Middleware ${middlewareId} not found in ${providerId} controller`;
              }

              const options = opts.options;

              if (middleware.beforeRequest) {
                parentMiddleware.beforeRequest ??= [];
                parentMiddleware.beforeRequest.push({
                  handler: middleware.beforeRequest,
                  options,
                });
              }

              if (middleware.serializeResponseData) {
                parentMiddleware.serializeResponseData ??= [];
                parentMiddleware.serializeResponseData.push({
                  handler: middleware.serializeResponseData,
                  options,
                });
              }

              if (middleware.serializeException) {
                parentMiddleware.serializeException ??= [];
                parentMiddleware.serializeException.push({
                  handler: middleware.serializeException,
                  options,
                });
              }

              break;
            }
          }
        }

        for (const prop of props) {
          if (prop.kind !== 'method') {
            continue;
          }

          const {
            propKey,
            options: { path, method, injects },
          } = prop;

          const normalizedPath = normalizePath(...parentPaths, path);

          this.routes
            .getOrInsertComputed(normalizedPath, () => new Map())
            .getOrInsertComputed(method ?? null, () => [])
            .push({
              middleware: {
                serializeResponseData: [...parentMiddleware.serializeResponseData],
                serializeException: [...parentMiddleware.serializeException],
                beforeRequest: [...parentMiddleware.beforeRequest],
              },
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

  async resolveInjection(
    context: RequestContext,
    moduleId: ModuleId,
    injection: unknown,
  ): Promise<unknown> {
    let token: unknown;
    let path: string | undefined;
    let schema: ZodType | undefined;

    if (isObject(injection) && 'token' in injection && 'schema' in injection) {
      token = injection.token;
      schema = injection.schema as ZodType;
    } else {
      token = injection;
    }

    let result: unknown;

    switch (token) {
      case Request:
        result = context.request;
        break;

      case Headers:
        result = context.headers;
        break;

      case URL:
        result = context.url;
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

        if (result === undefined && !schema) {
          result = context.request.body;
        }
        break;

      case RequestContext:
        result = context;
        break;

      default:
        if (token) {
          result = await this.container.tryResolveProvider(token, {
            moduleId,
            requestId: context.requestId,
          });
        }
    }

    if (schema && path) {
      const parsed = await schema.safeParseAsync(result);

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

    return result ?? null;
  }

  async processRequest(context: RequestContext): Promise<Response | null> {
    let response: Response | null | undefined;

    const { requestId } = context;

    if (context.path) {
      const routes = this.routes.get(context.path)?.get(context.method);

      if (routes) {
        for (const { providerId, moduleId, middleware, propKey, injects } of routes) {
          let exception: HttpException | undefined;

          try {
            if (middleware.beforeRequest.length) {
              for (const { handler, options } of middleware.beforeRequest) {
                await handler(context, options);
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
              for (const injection of injects) {
                args.push(await this.resolveInjection(context, moduleId, injection));
              }
            }

            const result = await controller[propKey](...args);

            if (result === null || result instanceof Response) {
              response = result;
              break;
            }

            if (result !== undefined) {
              if (middleware.serializeResponseData.length) {
                for (const { handler, options } of middleware.serializeResponseData) {
                  response = await handler(result, context, options);

                  if (response instanceof Response) {
                    break;
                  }

                  response = undefined;
                }
              } else {
                exception = new NotImplementedException();
              }
            }
          } catch (err) {
            if (HttpException.isInstance(err)) {
              exception = err;
            } else if (Error.isError(err) && err.name === 'ZodError') {
              exception = new ValidationFailedException({
                errors: (err as ZodError).issues,
              });
            } else {
              context.logger?.fatal('Unhandled error', err);

              exception = new InternalServerErrorException();
            }
          }

          if (exception) {
            if (middleware.serializeException.length) {
              for (const { handler, options } of middleware.serializeException) {
                response = await handler(exception, context, options);

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
