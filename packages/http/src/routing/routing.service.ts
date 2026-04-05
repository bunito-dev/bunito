import type { Class } from '@bunito/common';
import { getDecoratorMetadata, isUndefined } from '@bunito/common';
import type { CallableInstance, ModuleId } from '@bunito/core';
import { Container, Id, Logger, OnInit, Provider } from '@bunito/core';
import type { HttpContext, HttpMethod } from '../types';
import {
  DECORATOR_METADATA_KEYS,
  ROUTE_DYNAMIC_SEGMENT_ALIASES,
  ROUTE_DYNAMIC_SEGMENT_KEYS,
} from './constants';
import type {
  RouteHandler,
  RouteNode,
  RoutePath,
  RouteRequestDefinition,
  RouteRequestMatch,
  RouteResponseDefinition,
  RouteResponseMatch,
  RouteSegment,
} from './types';
import { processTokenizedPath, tokenizePath } from './utils';

@Provider({
  injects: [Logger, Container],
})
export class RoutingService {
  private readonly rootNode: RouteNode = {
    exact: true,
  };

  constructor(
    private readonly logger: Logger,
    private readonly container: Container,
  ) {
    logger.setContext(RoutingService);
  }

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
            getDecoratorMetadata<RoutePath>(parentClass, DECORATOR_METADATA_KEYS.PATH),
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
            getDecoratorMetadata<RoutePath>(useClass, DECORATOR_METADATA_KEYS.PATH),
          ),
        ),
      );

      this.detectRequestEntities(parentNode, useClass, moduleId);
      this.detectResponseEntities(parentNode, useClass, moduleId);
    }
  }

  async processRequest(request: Request): Promise<Response | undefined> {
    const url = new URL(request.url);
    const path = url.pathname as RoutePath;
    const method = request.method as HttpMethod;

    const requestMatches: RouteRequestMatch[] = [];
    const responseMatches: RouteResponseMatch[] = [];

    this.matchRoute(tokenizePath(path), method, requestMatches, responseMatches);

    if (!requestMatches.length && !responseMatches.length) {
      return;
    }

    const requestId = Id.unique(`request`);
    // const traceId = requestId.index.toString(16);

    let response: unknown;

    this.logger.trace(`${method}`);

    const context: HttpContext = {
      request,
      params: {},
      body: null,
      query: {},
      data: {},
    };

    for (const { params, handler } of requestMatches) {
      const result = await handler(requestId, {
        ...context,
        params,
      });

      if (isUndefined(result)) {
        continue;
      }

      if (result instanceof Response) {
        return result;
      }

      response = result;
      break;
    }

    for (const { params, handler } of responseMatches) {
      const result = await handler(requestId, response, {
        ...context,
        params,
      });

      if (isUndefined(result)) {
        continue;
      }

      if (result instanceof Response) {
        return result;
      }

      response = result;
      break;
    }

    switch (typeof response) {
      case 'string':
        return new Response(response);

      case 'undefined':
      case 'function':
        return;

      default:
        return Response.json(response);
    }
  }

  private matchRoute(
    pathTokens: string[],
    method: HttpMethod,
    requestMatches: RouteRequestMatch[],
    responseMatches: RouteResponseMatch[],
    depth: number = 0,
    node: RouteNode = this.rootNode,
    params: Record<string, string> = {},
  ): void {
    for (const entity of node.requests ?? []) {
      if (
        (!node.exact || pathTokens.length === depth) &&
        (entity.options.method === 'ALL' || entity.options.method === method)
      ) {
        requestMatches.push({
          params: { ...params },
          ...entity,
        });
      }
    }

    for (const entity of node.responses ?? []) {
      if (entity.options.method === 'ALL' || entity.options.method === method) {
        responseMatches.push({
          params: { ...params },
          ...entity,
        });
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
        childNode.segment.kind === 'PARAM'
          ? {
              ...params,
              [childNode.segment.name]: pathToken,
            }
          : params;

      this.matchRoute(
        pathTokens,
        method,
        requestMatches,
        responseMatches,
        depth + 1,
        childNode,
        childParams,
      );
    }
  }

  private createRouteHandler(
    controllerClass: Class,
    moduleId: ModuleId,
    propKey: PropertyKey,
  ): RouteHandler {
    return async (requestId, ...args) => {
      const instance = await this.container.resolve<CallableInstance>(controllerClass, {
        moduleId,
        requestId,
      });

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
      DECORATOR_METADATA_KEYS.REQUEST,
    );

    if (!definitions) {
      return;
    }

    for (const definition of definitions) {
      const { propKey, options } = definition;
      const { path } = options;

      const segments = processTokenizedPath(...tokenizePath(path));

      const node = this.touchNode(segments, parentNode);

      node.requests ??= [];
      node.requests.push({
        options,
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
      DECORATOR_METADATA_KEYS.RESPONSE,
    );

    if (!definitions) {
      return;
    }

    parentNode.responses ??= [];

    for (const definition of definitions) {
      const { propKey, options } = definition;

      parentNode.responses.push({
        options,
        handler: this.createRouteHandler(controllerClass, moduleId, propKey),
      });
    }
  }

  private touchNode(segments: RouteSegment[], parent = this.rootNode): RouteNode {
    let current = parent;

    for (const segment of segments) {
      const key =
        segment.kind === 'STATIC'
          ? segment.value
          : ROUTE_DYNAMIC_SEGMENT_ALIASES[segment.kind];

      let child = current.children?.get(key);

      if (!child) {
        child = {
          exact: segment.kind !== 'WILDCARD',
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
