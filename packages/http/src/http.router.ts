import type { Class } from '@bunito/common';
import { getDecoratorMetadata } from '@bunito/common';
import type { ModuleId } from '@bunito/core';
import { Container, Logger, OnInit, Provider } from '@bunito/core';
import { DECORATOR_METADATA_KEYS } from './constants';
import type { HttpPath, RequestRouteDefinition, ResponseRouteDefinition } from './types';

type RouteParams = Record<string, string>;

type RouteSegment =
  | { kind: 'static'; value: string }
  | { kind: 'param'; name: string }
  | { kind: 'wildcard' }
  | { kind: 'deepWildcard' };

type RouteContext = {
  request: Request;
  moduleId: ModuleId;
  controllerClass: Class;
  propKey: PropertyKey;
  params: RouteParams;
};

type RequestRouteHandler = (context: RouteContext) => Promise<Response> | Response;

type ResponseRouteHandler = (
  response: Response,
  context: RouteContext,
) => Promise<Response> | Response;

type RequestRouteEntry = {
  moduleId: ModuleId;
  controllerClass: Class;
  propKey: PropertyKey;
  fullPath: HttpPath;
  handler: RequestRouteHandler;
};

type ResponseRouteEntry = {
  moduleId: ModuleId;
  controllerClass: Class;
  propKey: PropertyKey;
  fullPath: HttpPath;
  handler: ResponseRouteHandler;
};

type RouteMatch = {
  requestEntry?: RequestRouteEntry;
  responseEntries: ResponseRouteEntry[];
  params: RouteParams;
};

type RouteNode = {
  staticChildren: Map<string, RouteNode>;
  paramChild?: {
    name: string;
    node: RouteNode;
  };
  wildcardChild?: RouteNode;
  deepWildcardChild?: RouteNode;
  requestEntry?: RequestRouteEntry;
  responseEntries: ResponseRouteEntry[];
};

function createRouteNode(): RouteNode {
  return {
    staticChildren: new Map<string, RouteNode>(),
    responseEntries: [],
  };
}

@Provider({
  injects: [Container, Logger],
})
export class HttpRouter {
  private readonly root: RouteNode = {
    staticChildren: new Map(),
    responseEntries: [],
  };

  constructor(
    private readonly container: Container,
    private readonly logger: Logger,
  ) {
    logger.setContext(HttpRouter);
  }

  @OnInit()
  async setupRoutes(): Promise<void> {
    const { controllers } = this.container;

    for (const { moduleId, useClass, parentClasses } of controllers) {
      const parentPaths: HttpPath[] = [];

      for (const targetClass of [...parentClasses, useClass]) {
        const parentPath = getDecoratorMetadata<HttpPath>(
          targetClass,
          DECORATOR_METADATA_KEYS.path,
        );

        if (parentPath) {
          parentPaths.push(parentPath);
        }

        this.detectRoute(parentPaths, moduleId, targetClass);
      }
    }
  }

  async processRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const match = this.matchRoute(pathname);

    if (!match?.requestEntry) {
      return Response.json(
        {
          pathname,
          error: 'Route not found',
        },
        { status: 404 },
      );
    }

    const context: RouteContext = {
      request,
      moduleId: match.requestEntry.moduleId,
      controllerClass: match.requestEntry.controllerClass,
      propKey: match.requestEntry.propKey,
      params: match.params,
    };

    let response = await match.requestEntry.handler(context);

    for (const responseEntry of match.responseEntries) {
      response = await responseEntry.handler(response, {
        ...context,
        moduleId: responseEntry.moduleId,
        controllerClass: responseEntry.controllerClass,
        propKey: responseEntry.propKey,
      });
    }

    return response;
  }

  private detectRoute(
    parentPaths: HttpPath[],
    moduleId: ModuleId,
    controllerClass: Class,
  ): void {
    const requestHandlers =
      getDecoratorMetadata<RequestRouteDefinition[]>(
        controllerClass,
        DECORATOR_METADATA_KEYS.request,
      ) ?? [];

    const responseHandlers =
      getDecoratorMetadata<ResponseRouteDefinition[]>(
        controllerClass,
        DECORATOR_METADATA_KEYS.response,
      ) ?? [];

    for (const { propKey, options } of requestHandlers ?? []) {
      const fullPath = this.joinPaths(parentPaths, options.path);

      this.insertRequestRoute(fullPath, {
        moduleId,
        controllerClass: controllerClass,
        propKey,
        fullPath,
        handler: ({ params, request }) => {
          return Response.json({
            pathname: new URL(request.url).pathname,
            params,
            propKey,
            options,
          });
        },
      });
    }

    for (const { propKey, options } of responseHandlers ?? []) {
      const fullPath = this.joinPaths(parentPaths, options.path);

      this.insertResponseRoute(fullPath, {
        moduleId,
        controllerClass: controllerClass,
        propKey,
        fullPath,
        handler: (response) => {
          return response;
        },
      });
    }
  }

  private insertRequestRoute(path: HttpPath, entry: RequestRouteEntry): void {
    const node = this.getOrCreateNode(path);

    if (node.requestEntry) {
      this.logger.warn(
        `Duplicate request route detected for "${path}". Overwriting previous handler.`,
      );
    }

    node.requestEntry = entry;
  }

  private insertResponseRoute(path: HttpPath, entry: ResponseRouteEntry): void {
    const node = this.getOrCreateNode(path);
    node.responseEntries.push(entry);
  }

  private getOrCreateNode(path: HttpPath): RouteNode {
    const segments = this.parsePath(path);
    let node = this.root;

    for (const segment of segments) {
      switch (segment.kind) {
        case 'static': {
          let child = node.staticChildren.get(segment.value);

          if (!child) {
            child = createRouteNode();
            node.staticChildren.set(segment.value, child);
          }

          node = child;
          break;
        }

        case 'param': {
          if (!node.paramChild) {
            node.paramChild = {
              name: segment.name,
              node: createRouteNode(),
            };
          }

          node = node.paramChild.node;
          break;
        }

        case 'wildcard': {
          if (!node.wildcardChild) {
            node.wildcardChild = createRouteNode();
          }

          node = node.wildcardChild;
          break;
        }

        case 'deepWildcard': {
          if (!node.deepWildcardChild) {
            node.deepWildcardChild = createRouteNode();
          }

          node = node.deepWildcardChild;
          break;
        }
      }
    }

    return node;
  }

  private matchRoute(pathname: string): RouteMatch | null {
    const segments = this.tokenizePath(pathname);

    return this.matchNode(this.root, segments, 0, {});
  }

  private matchNode(
    node: RouteNode,
    segments: string[],
    index: number,
    params: RouteParams,
  ): RouteMatch | null {
    if (index === segments.length) {
      if (node.requestEntry || node.responseEntries.length > 0) {
        return {
          requestEntry: node.requestEntry,
          responseEntries: [...node.responseEntries],
          params,
        };
      }

      if (node.deepWildcardChild) {
        const deepMatch = this.matchNode(node.deepWildcardChild, segments, index, params);

        if (deepMatch) {
          return deepMatch;
        }
      }

      return null;
    }

    const segment = segments[index] as string;

    const staticChild = node.staticChildren.get(segment);

    if (staticChild) {
      const staticMatch = this.matchNode(staticChild, segments, index + 1, params);

      if (staticMatch) {
        return staticMatch;
      }
    }

    if (node.paramChild) {
      const paramMatch = this.matchNode(node.paramChild.node, segments, index + 1, {
        ...params,
        [node.paramChild.name]: segment,
      });

      if (paramMatch) {
        return paramMatch;
      }
    }

    if (node.wildcardChild) {
      const wildcardMatch = this.matchNode(
        node.wildcardChild,
        segments,
        index + 1,
        params,
      );

      if (wildcardMatch) {
        return wildcardMatch;
      }
    }

    if (node.deepWildcardChild) {
      const deepMatchWithoutConsuming = this.matchNode(
        node.deepWildcardChild,
        segments,
        index,
        params,
      );

      if (deepMatchWithoutConsuming) {
        return deepMatchWithoutConsuming;
      }

      const deepMatchConsuming = this.matchNode(
        node.deepWildcardChild,
        segments,
        index + 1,
        params,
      );

      if (deepMatchConsuming) {
        return deepMatchConsuming;
      }
    }

    return null;
  }

  private parsePath(path: HttpPath): RouteSegment[] {
    return this.tokenizePath(path).map((part): RouteSegment => {
      if (part === '*') {
        return { kind: 'wildcard' };
      }

      if (part === '**') {
        return { kind: 'deepWildcard' };
      }

      if (part.startsWith(':')) {
        return {
          kind: 'param',
          name: part.slice(1),
        };
      }

      return {
        kind: 'static',
        value: part,
      };
    });
  }

  private tokenizePath(path: string): string[] {
    if (path === '/') {
      return [];
    }

    return path.split('/').filter(Boolean);
  }

  private joinPaths(parentPaths: HttpPath[], childPath?: HttpPath): HttpPath {
    const segments = [...parentPaths, childPath]
      .filter((value): value is HttpPath => Boolean(value))
      .flatMap((value) => this.tokenizePath(value));

    if (segments.length === 0) {
      return '/' as HttpPath;
    }

    return `/${segments.join('/')}` as HttpPath;
  }
}
