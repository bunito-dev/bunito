import type { Class } from '@bunito/common';
import { getDecoratorMetadata, isString } from '@bunito/common';
import type { CallableInstance, ModuleId, RequestId, ResolveConfig } from '@bunito/core';
import { Container, Id, Logger, MODULE_ID, OnInit, Provider } from '@bunito/core';
import { ZodError } from 'zod';
import { HttpException, ValidationException } from '../exceptions';
import type { HttpMethod } from '../types';
import {
  ROUTE_DYNAMIC_SEGMENT_ALIASES,
  ROUTE_DYNAMIC_SEGMENT_KEYS,
  ROUTING_METADATA_KEYS,
} from './constants';
import { RoutingConfig } from './routing.config';
import type {
  InspectedRoute,
  OnExceptionDefinition,
  OnExceptionMatch,
  OnRequestDefinition,
  OnRequestMatch,
  OnRequestSchema,
  OnResponseDefinition,
  OnResponseMatch,
  RouteContext,
  RouteHandler,
  RouteMatches,
  RouteMethod,
  RouteNode,
  RoutePath,
  RouteSegment,
} from './types';
import { normalizeSearchParams, processTokenizedPath, tokenizePath } from './utils';

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
            getDecoratorMetadata<RoutePath>(parentClass, ROUTING_METADATA_KEYS.USES_PATH),
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
            getDecoratorMetadata<RoutePath>(useClass, ROUTING_METADATA_KEYS.USES_PATH),
          ),
        ),
      );

      this.detectOnRequestEntities(parentNode, useClass, moduleId);
      this.detectOnResponseEntities(parentNode, useClass, moduleId);
      this.detectOnExceptionEntities(parentNode, useClass, moduleId);
    }

    this.inspectRoutes();
  }

  inspectRoutes(): InspectedRoute[] {
    const inspectedRoute: InspectedRoute[] = [];

    this.inspectRoute(inspectedRoute);

    return inspectedRoute;
  }

  async processRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname as RoutePath;
    const method = request.method as HttpMethod;

    const requestId = Id.unique('REQUEST');

    const logger = await this.container.resolveProvider(Logger, {
      requestId,
      moduleId: this.moduleId,
    });

    logger.setContext('HttpRequest');

    const trace = logger.trace();

    const matches: RouteMatches = {
      onRequest: [],
      onResponse: [],
      onException: [],
    };

    this.matchRoute(tokenizePath(path), method, matches);

    const context: RouteContext = {
      request,
      logger,
      url,
      path,
      method,
      data: {},
      query: normalizeSearchParams(url.searchParams),
      params: {},
      body: await this.readRequestBody(request),
    };

    let response: Response;

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

    trace.debug(`${response.status} ${method} ${path}`);

    return response;
  }

  private async readRequestBody(request: Request): Promise<unknown> {
    if (request.body) {
      const contentType =
        request.headers.get('Content-Type') ?? this.config.defaultContentType;

      switch (contentType) {
        case 'application/json':
          return await request.json();

        case 'text/plain':
          return await request.text();

        default:
          return request.body;
      }
    }

    return null;
  }

  private async prepareRequestContext(
    params: Record<string, string>,
    context: RouteContext,
    schema: OnRequestSchema | null,
  ): Promise<RouteContext> {
    const result: RouteContext = {
      ...context,
      params,
    };

    if (!schema) {
      return result;
    }

    const parsed = await schema.parseAsync(result);

    Object.assign(result, parsed);

    return result;
  }

  private async handleRequest(
    requestId: RequestId,
    routeContext: RouteContext,
    routeMatches: OnRequestMatch[],
  ): Promise<unknown> {
    for (const { handler, params, options } of routeMatches) {
      const result = await handler(
        requestId,
        await this.prepareRequestContext(params, routeContext, options.schema),
      );

      if (result === undefined) {
        continue;
      }

      return result;
    }
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

    switch (this.config.defaultContentType) {
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
        const response = await handler(requestId, exception, routeContext);

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
      logger.warn(cause);
    } else if (cause) {
      logger.fatal('Unhandled exception', cause);
    }

    switch (this.config.defaultContentType) {
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

  private inspectRoute(
    inspectedRoutes: InspectedRoute[] = [],
    parentPaths: RoutePath[] = [],
    node: RouteNode = this.rootNode,
  ): void {
    const { segment, children, handlers } = node;

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

    const routeMethods: Partial<Record<RouteMethod, InspectedRoute>> = {};

    for (const {
      propKey,
      controllerName,
      options: { method },
    } of handlers?.onRequest ?? []) {
      routeMethods[method] ??= { path, method };

      const inspect = {
        propKey,
        controllerName,
      };

      if (!routeMethods[method]?.onRequest?.push(inspect)) {
        routeMethods[method].onRequest = [inspect];
      }
    }

    for (const {
      propKey,
      controllerName,
      options: { method },
    } of handlers?.onResponse ?? []) {
      routeMethods[method] ??= { path, method };

      const inspect = {
        propKey,
        controllerName,
      };

      if (!routeMethods[method]?.onResponse?.push(inspect)) {
        routeMethods[method].onResponse = [inspect];
      }
    }

    for (const {
      propKey,
      controllerName,
      options: { method },
    } of handlers?.onException ?? []) {
      routeMethods[method] ??= { path, method };

      const inspect = {
        propKey,
        controllerName,
      };

      if (!routeMethods[method]?.onError?.push(inspect)) {
        routeMethods[method].onError = [inspect];
      }
    }

    inspectedRoutes.push(...Object.values(routeMethods));

    for (const child of children?.values() ?? []) {
      this.inspectRoute(inspectedRoutes, [...parentPaths], child);
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

  private detectOnRequestEntities(
    parentNode: RouteNode,
    controllerClass: Class,
    moduleId: ModuleId,
  ): void {
    const definitions = getDecoratorMetadata<OnRequestDefinition[]>(
      controllerClass,
      ROUTING_METADATA_KEYS.ON_REQUEST,
    );

    if (!definitions) {
      return;
    }

    for (const definition of definitions) {
      const { propKey, options } = definition;
      const { path } = options;

      const segments = processTokenizedPath(...tokenizePath(path));

      const node = this.touchNode(segments, parentNode);

      node.handlers ??= {};
      node.handlers.onRequest ??= [];
      node.handlers.onRequest.push({
        options,
        controllerName: controllerClass.name,
        propKey,
        handler: this.createRouteHandler(controllerClass, moduleId, propKey),
      });
    }
  }

  private detectOnResponseEntities(
    parentNode: RouteNode,
    controllerClass: Class,
    moduleId: ModuleId,
  ): void {
    const definitions = getDecoratorMetadata<OnResponseDefinition[]>(
      controllerClass,
      ROUTING_METADATA_KEYS.ON_RESPONSE,
    );

    if (!definitions) {
      return;
    }

    parentNode.handlers ??= {};
    parentNode.handlers.onResponse ??= [];

    for (const definition of definitions) {
      const { propKey, options } = definition;

      parentNode.handlers.onResponse.push({
        options,
        controllerName: controllerClass.name,
        propKey,
        handler: this.createRouteHandler(controllerClass, moduleId, propKey),
      });
    }
  }

  private detectOnExceptionEntities(
    parentNode: RouteNode,
    controllerClass: Class,
    moduleId: ModuleId,
  ): void {
    const definitions = getDecoratorMetadata<OnExceptionDefinition[]>(
      controllerClass,
      ROUTING_METADATA_KEYS.ON_EXCEPTION,
    );

    if (!definitions) {
      return;
    }

    parentNode.handlers ??= {};
    parentNode.handlers.onException ??= [];

    for (const definition of definitions) {
      const { propKey, options } = definition;

      parentNode.handlers.onException.push({
        options,
        controllerName: controllerClass.name,
        propKey,
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
