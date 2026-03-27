import { getDecoratorMetadata, isObject } from '@bunito/common';
import type { ProviderInstance, ResolveConfig } from '@bunito/core';
import { Container, Id, Logger, Provider, Setup } from '@bunito/core';
import { z } from 'zod';
import { HTTP_CONTROLLER_METADATA_KEYS } from './constants';
import { httpConfig } from './http.config';
import { HttpException } from './http.exception';
import type {
  HttpContext,
  HttpHandlerDefinition,
  HttpHandlerOptions,
  HttpPath,
  HttpRequest,
  HttpRoute,
} from './types';
import { normalizePath } from './utils';

@Provider({
  injects: [httpConfig, Container, Logger],
})
export class HttpService {
  private readonly handlers = new Map<
    string,
    Map<string, Array<HttpHandlerDefinition>>
  >();

  private server: Bun.Server<unknown> | undefined;

  constructor(
    private readonly config: ResolveConfig<typeof httpConfig>,
    private readonly container: Container,
    private readonly logger: Logger,
  ) {
    logger.setContext(HttpService);
  }

  inspectRoutes(): Array<string> {
    const routes: Array<string> = [];

    for (const [path, methods] of this.handlers) {
      for (const [method, handlers] of methods) {
        routes.push(`${method} ${path} (${handlers.length})`);
      }
    }

    return routes;
  }

  @Setup()
  async resolveHandlers(): Promise<void> {
    this.handlers.clear();

    for (const { moduleId, classStack } of this.container.controllers) {
      const lastIndex = classStack.length - 1;

      const pathStack: Array<HttpPath> = [];

      for (const [index, targetClass] of classStack.entries()) {
        const path = getDecoratorMetadata<HttpPath>(
          targetClass,
          HTTP_CONTROLLER_METADATA_KEYS.path,
        );

        if (path) {
          pathStack.push(path);
        }

        // TODO: Add support for middleware

        if (index !== lastIndex) {
          continue;
        }

        const methods = getDecoratorMetadata<Array<HttpHandlerOptions>>(
          targetClass,
          HTTP_CONTROLLER_METADATA_KEYS.methods,
        );

        if (!methods) {
          continue;
        }

        for (const options of methods) {
          const resolvedOptions = {
            ...options,
            path: normalizePath(...pathStack, options.path),
          };

          const routes = this.handlers.get(resolvedOptions.path);

          const handler: HttpHandlerDefinition = {
            targetClass,
            moduleId,
            options: resolvedOptions,
          };

          if (!routes) {
            this.handlers.set(
              resolvedOptions.path,
              new Map([[resolvedOptions.method, [handler]]]),
            );
            continue;
          }

          const methods = routes.get(resolvedOptions.method);

          if (!methods) {
            routes.set(resolvedOptions.method, [handler]);
            continue;
          }

          methods.push(handler);
        }
      }
    }

    this.logger.debug(`Found ${this.handlers.size} routes`);
  }

  startServer(): void {
    const routes: Record<string, Record<string, HttpRoute>> = {};

    for (const [path, methods] of this.handlers) {
      const handlers: Record<string, HttpRoute> = {};

      for (const method of methods.keys()) {
        handlers[method] = async (request: HttpRequest) =>
          this.processRequest(request, path);
      }

      routes[path] = handlers;
    }

    const { port } = this.config;

    this.server = Bun.serve({
      port,
      routes,
      fetch: async (req): Promise<Response> => this.processRequest(req),
    });

    this.logger.trace(`Listening on ${port}`);
  }

  async stop(): Promise<void> {
    await this.server?.stop();
  }

  async processRequest(request: HttpRequest, path?: string): Promise<Response> {
    const { method } = request;

    let response: Response | undefined;

    if (!path) {
      response = new HttpException(404).toResponse();
    } else {
      const handlers = this.handlers.get(path)?.get(method);

      if (handlers) {
        const requestId = Id.unique('request');

        const url = new URL(request.url);
        const params = (request.params as Record<string, unknown>) ?? {};
        const query: Record<string, unknown> = {};
        const data: Record<string, unknown> = {};

        for (const [key, value] of url.searchParams.entries()) {
          query[key] = value;
        }

        let body: unknown;

        // TODO: Add support for multipart/form-data
        if (request.body) {
          try {
            body = await request.json();
          } catch {
            // ignore
          }
        }

        const context: HttpContext = {
          request,
          url,
          path: path as HttpPath,
          params,
          data,
          body,
          query,
        };

        main: for (const { moduleId, targetClass, options } of handlers) {
          const instance = (await this.container.resolveProvider(targetClass, {
            moduleId,
            requestId,
          })) as ProviderInstance;

          const name = options.name;

          if (!isObject(instance) || !instance[name]) {
            continue;
          }

          const contextCopy = {
            ...context,
          };

          for (const [key, parsed] of [
            ['query', options.schema?.query?.safeParse(query)] as const,
            ['params', options.schema?.params?.safeParse(params)] as const,
            ['body', options.schema?.body?.safeParse(body)] as const,
          ]) {
            if (!parsed) {
              continue;
            }

            if (parsed.success) {
              contextCopy[key] = parsed.data;
              continue;
            }

            // TODO: Add support for custom error responses
            response = new HttpException(400, {
              [key]: z.treeifyError(parsed.error).properties,
            }).toResponse();
            break main;
          }

          try {
            const result = await instance[name](contextCopy);

            if (result !== undefined) {
              response = result instanceof Response ? result : Response.json(result);
              break;
            }
          } catch (err) {
            response = HttpException.capture(err).toResponse();
            break;
          }
        }
      }

      if (!response) {
        response = new HttpException(405).toResponse();
      }
    }

    return response;
  }
}
