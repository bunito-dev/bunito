import type { Class } from '@bunito/common';
import { getDecoratorMetadata, isString, str } from '@bunito/common';
import type { CallableInstance, ModuleId, RequestId, ResolveConfig } from '@bunito/core';
import { Container, Id, Logger, MODULE_ID, OnInit, Provider } from '@bunito/core';
import { HTTP_SUCCESS_STATUS_CODES } from '../constants';
import { HttpException } from '../http.exception';
import type { HttpMethod } from '../types';
import {
  DECORATOR_METADATA_KEYS,
  ROUTE_DYNAMIC_SEGMENT_ALIASES,
  ROUTE_DYNAMIC_SEGMENT_KEYS,
} from './constants';
import { RoutingConfig } from './routing.config';
import type {
  InspectedRoute,
  RouteContext,
  RouteErrorDefinition,
  RouteHandler,
  RouteMatches,
  RouteNode,
  RoutePath,
  RouteRequestDefinition,
  RouteResponseDefinition,
  RouteSegment,
} from './types';
import { processTokenizedPath, tokenizePath } from './utils';

@Provider({
  injects: [RoutingConfig, Container, MODULE_ID],
})
export class RoutingService {
  private readonly rootNode: RouteNode = {
    exact: true,
  };

  constructor(
    private readonly config: ResolveConfig<typeof RoutingConfig>,
    private readonly container: Container,
    private readonly moduleId: ModuleId,
  ) {}

  @OnInit()
  async setupRoutes(): Promise<void> {
    const parentMetadata = new Map<
      object,
      {
        pathTokens: string[];
      }
    >();

    for (const { parentClasses, useClass, moduleId } of this.container.controllers) {
      let pathTokens = parentMetadata.get(parentClasses)?.pathTokens;

      if (!pathTokens) {
        pathTokens = tokenizePath(
          ...parentClasses.map((parentClass) =>
            getDecoratorMetadata<RoutePath>(
              parentClass,
              DECORATOR_METADATA_KEYS.USES_PATH,
            ),
          ),
        );

        parentMetadata.set(parentClasses, {
          pathTokens,
        });
      }

      const parentNode = this.touchNode(
        processTokenizedPath(
          ...pathTokens,
          ...tokenizePath(
            getDecoratorMetadata<RoutePath>(useClass, DECORATOR_METADATA_KEYS.USES_PATH),
          ),
        ),
      );

      this.detectRequestEntities(parentNode, useClass, moduleId);
      this.detectResponseEntities(parentNode, useClass, moduleId);
      this.detectErrorEntities(parentNode, useClass, moduleId);
    }

    this.inspectRoutes();
  }

  inspectRoutes(): InspectedRoute[] {
    const inspectedRoute: InspectedRoute[] = [];

    this.inspectRoute(inspectedRoute);

    return inspectedRoute;
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname as RoutePath;
    const method = request.method as HttpMethod;

    const requestId = Id.unique('REQUEST');

    const logger = await this.container.resolveProvider(Logger, {
      requestId,
      moduleId: this.moduleId,
    });

    logger.setContext(RoutingService);

    const track = logger.track();

    const context: RouteContext = {
      request,
      path,
      method,
      params: {},
      query: {},
      body: null,
      data: {},
    };

    let response: Response;
    let exception: HttpException | undefined;

    try {
      response = await this.processRequest(requestId, context);
    } catch (err) {
      exception = HttpException.capture(err);

      response = exception.toResponse(this.config.defaultContentType);
    }

    track(`${response.status} ${method} ${path}`);

    if (exception?.cause) {
      if (isString(exception.cause)) {
        logger.warn(exception.cause);
      } else {
        logger.fatal('Unhandled exception', exception.cause);
      }
    }

    return response;
  }

  async processRequest(requestId: RequestId, context: RouteContext): Promise<Response> {
    const matches: RouteMatches = {
      requests: [],
      responses: [],
      errors: [],
    };

    this.matchRoute(tokenizePath(context.path), context.method, matches);

    const { requests, responses, errors } = matches;

    let exception: HttpException | undefined;

    const { defaultContentType } = this.config;

    if (!requests.length) {
      exception = new HttpException('NOT_FOUND');
    } else {
      let responseData: unknown;

      try {
        for (const { params, handler } of requests) {
          const response = await handler(requestId, {
            ...context,
            params,
          });

          if (response === undefined) {
            continue;
          }

          if (response instanceof Response) {
            return response;
          }

          responseData = response;
          break;
        }

        for (const { params, handler } of responses) {
          const response = await handler(requestId, responseData, {
            ...context,
            params,
          });

          if (response === undefined) {
            continue;
          }

          if (response instanceof Response) {
            return response;
          }

          responseData = response;
          break;
        }
      } catch (err) {
        exception = HttpException.capture(err);
      }

      if (!exception) {
        if (responseData === undefined) {
          exception ??= new HttpException('NOT_FOUND');
        } else {
          switch (defaultContentType) {
            case 'text/plain':
              if (isString(responseData, false)) {
                return new Response(responseData, {
                  status: HTTP_SUCCESS_STATUS_CODES.OK,
                  headers: {
                    'Content-Type': 'text/plain',
                  },
                });
              }

              exception = new HttpException(
                'NOT_IMPLEMENTED',
                undefined,
                'Trying to return non-string value as text/plain response',
              );
              break;

            case 'application/json':
              return Response.json(responseData);

            default:
              exception = new HttpException(
                'NOT_IMPLEMENTED',
                undefined,
                'Cannot return response data as default content type',
              );
          }
        }
      }
    }

    if (exception) {
      try {
        for (const { handler } of errors) {
          const response = await handler(requestId, exception, context);

          if (response instanceof Response) {
            return response;
          }
        }
      } catch (err) {
        exception = HttpException.capture(err);
      }

      throw exception;
    }

    return new Response(null, {
      status: HTTP_SUCCESS_STATUS_CODES.NO_CONTENT,
    });
  }

  private inspectRoute(
    inspectedRoutes: InspectedRoute[] = [],
    parentPaths: RoutePath[] = [],
    node: RouteNode = this.rootNode,
  ): void {
    const { segment, children, entities } = node;

    switch (segment?.kind) {
      case 'static':
        parentPaths.push(`/${segment.value}`);
        break;

      case 'param':
        parentPaths.push(`/${ROUTE_DYNAMIC_SEGMENT_ALIASES.param}${segment.name}`);
        break;

      case 'any':
        parentPaths.push(`/${ROUTE_DYNAMIC_SEGMENT_ALIASES.any}`);
        break;

      case 'wildcard':
        parentPaths.push(`/${ROUTE_DYNAMIC_SEGMENT_ALIASES.wildcard}`);
        break;
    }

    const path = parentPaths.length ? (parentPaths.join('') as RoutePath) : '/';

    const routeMethods: Partial<Record<HttpMethod, InspectedRoute>> = {};

    for (const {
      name,
      options: { method },
    } of entities?.requests ?? []) {
      routeMethods[method] ??= { path, method };

      if (!routeMethods[method]?.onRequest?.push(name)) {
        routeMethods[method].onRequest = [name];
      }
    }

    for (const {
      name,
      options: { method },
    } of entities?.responses ?? []) {
      routeMethods[method] ??= { path, method };

      if (!routeMethods[method]?.onResponse?.push(name)) {
        routeMethods[method].onResponse = [name];
      }
    }

    for (const {
      name,
      options: { method },
    } of entities?.errors ?? []) {
      routeMethods[method] ??= { path, method };

      if (!routeMethods[method]?.onError?.push(name)) {
        routeMethods[method].onError = [name];
      }
    }

    inspectedRoutes.push(...Object.values(routeMethods));

    for (const child of children?.values() ?? []) {
      this.inspectRoute(inspectedRoutes, [...parentPaths], child);
    }
  }

  private matchRoute(
    pathTokens: string[],
    method: HttpMethod,
    matches: RouteMatches,
    depth: number = 0,
    node: RouteNode = this.rootNode,
    params: Record<string, string> = {},
  ): void {
    const { entities } = node;

    for (const entity of entities?.requests ?? []) {
      if (
        (!node.exact || pathTokens.length === depth) &&
        (entity.options.method === 'ALL' || entity.options.method === method)
      ) {
        matches.requests.push({
          params: { ...params },
          ...entity,
        });
      }
    }

    for (const entity of entities?.responses ?? []) {
      if (entity.options.method === 'ALL' || entity.options.method === method) {
        matches.responses.push({
          params: { ...params },
          ...entity,
        });
      }
    }

    for (const entity of entities?.errors ?? []) {
      if (entity.options.method === 'ALL' || entity.options.method === method) {
        matches.errors.push(entity);
      }
    }

    const pathToken = pathTokens.at(depth);

    if (!pathToken) {
      return;
    }

    for (const key of [pathToken, ...ROUTE_DYNAMIC_SEGMENT_KEYS]) {
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
    controllerClass: Class,
    moduleId: ModuleId,
    propKey: PropertyKey,
  ): RouteHandler {
    return async (requestId, ...args) => {
      const instance = await this.container.resolveProvider<CallableInstance>(
        controllerClass,
        {
          moduleId,
          requestId,
        },
      );

      if (!instance[propKey]) {
        return;
      }

      return instance[propKey](...args);
    };
  }

  private detectRequestEntities(
    parentNode: RouteNode,
    controllerClass: Class,
    moduleId: ModuleId,
  ): void {
    const definitions = getDecoratorMetadata<RouteRequestDefinition[]>(
      controllerClass,
      DECORATOR_METADATA_KEYS.ON_REQUEST,
    );

    if (!definitions) {
      return;
    }

    for (const definition of definitions) {
      const { propKey, options } = definition;
      const { path } = options;

      const segments = processTokenizedPath(...tokenizePath(path));

      const node = this.touchNode(segments, parentNode);

      node.entities ??= {};
      node.entities.requests ??= [];
      node.entities.requests.push({
        options,
        name: str`${controllerClass}#${propKey}`,
        handler: this.createRouteHandler(controllerClass, moduleId, propKey),
      });
    }
  }

  private detectResponseEntities(
    parentNode: RouteNode,
    controllerClass: Class,
    moduleId: ModuleId,
  ): void {
    const definitions = getDecoratorMetadata<RouteResponseDefinition[]>(
      controllerClass,
      DECORATOR_METADATA_KEYS.ON_RESPONSE,
    );

    if (!definitions) {
      return;
    }

    parentNode.entities ??= {};
    parentNode.entities.responses ??= [];

    for (const definition of definitions) {
      const { propKey, options } = definition;

      parentNode.entities.responses.push({
        options,
        name: str`${controllerClass}#${propKey}`,
        handler: this.createRouteHandler(controllerClass, moduleId, propKey),
      });
    }
  }

  private detectErrorEntities(
    parentNode: RouteNode,
    controllerClass: Class,
    moduleId: ModuleId,
  ): void {
    const definitions = getDecoratorMetadata<RouteErrorDefinition[]>(
      controllerClass,
      DECORATOR_METADATA_KEYS.ON_ERROR,
    );

    if (!definitions) {
      return;
    }

    parentNode.entities ??= {};
    parentNode.entities.errors ??= [];

    for (const definition of definitions) {
      const { propKey, options } = definition;

      parentNode.entities.errors.push({
        options,
        name: str`${controllerClass}#${propKey}`,
        handler: this.createRouteHandler(controllerClass, moduleId, propKey),
      });
    }
  }

  private touchNode(segments: RouteSegment[], parent = this.rootNode): RouteNode {
    let current = parent;

    for (const segment of segments) {
      const key =
        segment.kind === 'static'
          ? segment.value
          : ROUTE_DYNAMIC_SEGMENT_ALIASES[segment.kind];

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
