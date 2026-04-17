import type { CallableInstance } from '@bunito/common';
import { isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { ModuleId, ProviderId, RequestId } from '@bunito/container';
import { Container, OnInit } from '@bunito/container';
import type { FetchContext, RouterExtension } from '@bunito/server';
import { Router } from '@bunito/server';
import { ZodError } from 'zod';
import { DYNAMIC_SEGMENT_ALIASES, DYNAMIC_SEGMENT_KEYS } from './constants';
import { CONTROLLER_COMPONENT } from './controller';
import { HttpException, ValidationException } from './exceptions';
import { HttpConfig } from './http.config';
import type {
  ControllerMethodOptions,
  ControllerOptions,
  HttpMethod,
  HttpPath,
  OnExceptionMatch,
  OnRequestMatch,
  OnResponseMatch,
  RouteContext,
  RouteHandler,
  RouteMatches,
  RouteMethod,
  RouteNode,
  RouteSegment,
} from './types';
import { normalizeSearchParams, processTokenizedPath, tokenizePath } from './utils';

@Router({
  injects: [HttpConfig, Container],
})
export class HttpRouter implements RouterExtension {
  private readonly rootNode: RouteNode = {
    exact: true,
  };

  constructor(
    private readonly config: ResolveConfig<typeof HttpConfig>,
    private readonly container: Container,
  ) {}

  @OnInit()
  async setupRoutes(): Promise<void> {
    const components = this.container.getComponents<
      ControllerOptions,
      unknown,
      ControllerMethodOptions
    >(CONTROLLER_COMPONENT);

    for (const component of components) {
      if (!('useProviderId' in component) || !component.methods.length) {
        continue;
      }

      const { useProviderId: providerId, moduleId, options: opts, methods } = component;

      const parentPaths: HttpPath[] = [];

      if (opts) {
        for (const options of opts) {
          switch (options.kind) {
            case 'path': {
              parentPaths.push(options.path);
              break;
            }
          }
        }
      }

      const parentSegments = processTokenizedPath(...tokenizePath(...parentPaths));
      const parentNode = this.touchNode(parentSegments);

      for (const { propKey, options } of methods) {
        let node: RouteNode;

        switch (options.kind) {
          case 'onRequest': {
            node = this.touchNode([
              ...parentSegments,
              ...processTokenizedPath(...tokenizePath(options.path)),
            ]);
            break;
          }

          default:
            node = parentNode;
        }

        const handler = this.createRouteHandler(providerId, moduleId, propKey);

        node.handlers ??= {};
        node.handlers[options.kind] ??= [];

        switch (options.kind) {
          case 'onRequest': {
            const {
              method = 'ALL',
              schema = null,
              path = '/',
              priority = null,
            } = options;

            node.handlers.onRequest?.push({
              handler,
              options: {
                method,
                path,
                schema,
                priority,
              },
            });
            break;
          }

          case 'onException':
          case 'onResponse': {
            const { method = 'ALL' } = options;
            node.handlers[options.kind]?.push({
              handler,
              options: {
                method,
              },
            });
            break;
          }
        }
      }
    }
  }

  async processFetchRequest(
    request: Request,
    { requestId, url, logger, data }: FetchContext,
  ): Promise<Response | undefined> {
    const path = url.pathname as HttpPath;
    const method = request.method as HttpMethod;

    const matches: RouteMatches = {
      onRequest: [],
      onResponse: [],
      onException: [],
    };

    this.matchRoute(tokenizePath(path), method, matches);

    const context: RouteContext = {
      request,
      url,
      path,
      method,
      contentType:
        request.headers.get('Content-Type') ?? this.config.defaultRequestContentType,
      logger,
      data,
      query: normalizeSearchParams(url.searchParams),
      params: {},
      body: null,
    };

    let response: Response | undefined;

    try {
      const maybeResponse = await this.handleRequest(
        requestId,
        context,
        matches.onRequest,
      );

      if (maybeResponse instanceof Response) {
        response = maybeResponse;
      } else {
        response = await this.handleResponse(
          requestId,
          maybeResponse,
          context,
          matches.onResponse,
        );
      }
    } catch (err) {
      let exception: HttpException | undefined;

      if (err instanceof ZodError) {
        exception = ValidationException.fromZodError(err);
      }

      if (!exception) {
        exception = HttpException.capture(err);
      }

      response = await this.handleException(
        requestId,
        exception,
        context,
        matches.onException,
      );
    }

    return response;
  }

  private async handleRequest(
    requestId: RequestId,
    routeContext: RouteContext,
    routeMatches: OnRequestMatch[],
  ): Promise<unknown> {
    for (const targetPriority of ['high', null, 'low']) {
      for (const {
        handler,
        params,
        options: { schema, priority },
      } of routeMatches) {
        if (priority !== targetPriority) {
          continue;
        }

        let context = {
          ...routeContext,
          params,
        };

        const { query, body } = routeContext;

        if (schema) {
          const parsed = await schema.parseAsync({
            query,
            body,
            params,
          });

          context = {
            ...context,
            ...parsed,
          } as RouteContext;
        }

        const result = await handler(requestId, context);

        if (context.body !== body) {
          routeContext.body = context.body;
        }

        if (result === undefined) {
          continue;
        }

        return result;
      }
    }

    throw new HttpException('NOT_FOUND');
  }

  private async handleResponse(
    requestId: RequestId,
    responseData: unknown,
    routeContext: RouteContext,
    routeMatches: OnResponseMatch[],
  ): Promise<Response> {
    for (const { handler, params } of routeMatches) {
      const result = await handler(requestId, responseData, {
        ...routeContext,
        params,
      });

      if (result === undefined) {
        continue;
      }

      if (result instanceof Response) {
        return result;
      }
    }

    if (responseData === undefined) {
      throw new HttpException('NOT_FOUND');
    }

    switch (this.config.defaultResponseContentType) {
      case 'application/json':
        return Response.json(responseData);

      case 'text/plain':
        if (!isString(responseData, false)) {
          throw new HttpException(
            'NOT_IMPLEMENTED',
            undefined,
            'Trying to return non-string value as text/plain response',
          );
        }
        return new Response(responseData);

      default:
        throw new HttpException(
          'NOT_IMPLEMENTED',
          undefined,
          'Cannot return response data as default content type',
        );
    }
  }

  private async handleException(
    requestId: RequestId,
    exception: HttpException,
    routeContext: RouteContext,
    routeMatches: OnExceptionMatch[],
  ): Promise<Response> {
    let unhandledException = exception;

    try {
      for (const { handler } of routeMatches) {
        const response = await handler(requestId, exception, {
          ...routeContext,
        });

        if (response instanceof Response) {
          return response;
        }
      }
    } catch (err) {
      unhandledException = HttpException.capture(err);
    }

    const { logger } = routeContext;
    const { message, statusCode, cause } = unhandledException;

    if (isString(cause)) {
      logger?.warn(cause);
    } else if (cause) {
      logger?.fatal('Unhandled exception', cause);
    }

    switch (this.config.defaultResponseContentType) {
      case 'application/json':
        return Response.json(unhandledException.toJSON(), {
          status: statusCode,
        });

      default:
        return new Response(message, {
          status: statusCode,
        });
    }
  }

  private matchRoute(
    pathTokens: string[],
    method: RouteMethod,
    matches: RouteMatches,
    depth: number = 0,
    node: RouteNode = this.rootNode,
    params: Record<string, string> = {},
  ): void {
    const { handlers } = node;

    for (const entity of handlers?.onRequest ?? []) {
      if (
        (!node.exact || pathTokens.length === depth) &&
        (entity.options.method === 'ALL' || entity.options.method === method)
      ) {
        matches.onRequest.push({
          params: { ...params },
          ...entity,
        });
      }
    }

    for (const entity of handlers?.onResponse ?? []) {
      if (entity.options.method === 'ALL' || entity.options.method === method) {
        matches.onResponse.push({
          params: { ...params },
          ...entity,
        });
      }
    }

    for (const entity of handlers?.onException ?? []) {
      if (entity.options.method === 'ALL' || entity.options.method === method) {
        matches.onException.push(entity);
      }
    }

    const pathToken = pathTokens.at(depth);

    if (!pathToken) {
      return;
    }

    for (const key of [pathToken, ...DYNAMIC_SEGMENT_KEYS]) {
      const childNode = node.children?.get(key);

      if (!childNode?.segment) {
        continue;
      }

      const childParams =
        childNode.segment.kind === 'param'
          ? {
              ...params,
              [childNode.segment.name]: pathToken,
            }
          : params;

      this.matchRoute(pathTokens, method, matches, depth + 1, childNode, childParams);
    }
  }

  private createRouteHandler(
    providerId: ProviderId,
    moduleId: ModuleId,
    propKey: PropertyKey,
  ): RouteHandler {
    return async (requestId, ...args) => {
      const instance = await this.container.resolveProvider<
        CallableInstance<Promise<unknown>>
      >(providerId, {
        moduleId,
        requestId,
      });

      if (!instance[propKey]) {
        return;
      }

      return instance[propKey](...args);
    };
  }

  private touchNode(segments: RouteSegment[], parent = this.rootNode): RouteNode {
    let current = parent;

    for (const segment of segments) {
      const key =
        segment.kind === 'static' ? segment.value : DYNAMIC_SEGMENT_ALIASES[segment.kind];

      let child = current.children?.get(key);

      if (!child) {
        child = {
          exact: segment.kind !== 'wildcard',
          segment,
        };
        current.children ??= new Map();
        current.children.set(key, child);
      }

      current = child;
    }

    return current;
  }
}
