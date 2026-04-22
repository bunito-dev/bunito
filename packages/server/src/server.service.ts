import { Buffer } from 'node:buffer';
import { ConfigurationException, isFn, isObject, isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Container, Id, OnBoot, OnDestroy, OnInit, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { HTTP_METHODS, SERVER_EXTENSION, SERVER_FACTORY_ID } from './constants';
import { HttpException } from './exceptions';
import { ServerConfig } from './server.config';
import type { ServerExtension } from './server.extension';
import type {
  HttpMethod,
  HttpPath,
  RequestContext,
  RequestHandler,
  Server,
  ServerFactory,
  ServerOptions,
  ServerRequest,
  ServerRoutes,
  ServerWebSocket,
  WebSocketEvent,
  WebSocketHandler,
} from './types';
import { extractQuery } from './utils';

@Provider({
  scope: 'singleton',
  injects: [
    ServerConfig,
    Container,
    { token: SERVER_FACTORY_ID, optional: true },
    { token: Logger, optional: true },
  ],
})
export class ServerService {
  private server: Server | undefined;

  private readonly handlers: {
    routes: Map<HttpPath, Map<HttpMethod, RequestHandler[]>>;
    request: RequestHandler[];
    websocket: WebSocketHandler[];
  } = {
    routes: new Map(),
    request: [],
    websocket: [],
  };

  constructor(
    private readonly config: ResolveConfig<typeof ServerConfig>,
    private readonly container: Container,
    private readonly factory: ServerFactory | null,
    private readonly logger: Logger | null,
  ) {
    logger?.setContext(ServerService);
  }

  @OnInit()
  async configure(): Promise<void> {
    for (const { providerId, moduleId } of this.container.getExtensions(
      SERVER_EXTENSION,
    )) {
      const extension = await this.container.resolveProvider<ServerExtension>(
        providerId,
        {
          moduleId,
        },
      );

      if (
        !isObject(extension) ||
        (!isFn(extension.processRequest) && !isFn(extension.processWebSocketEvent))
      ) {
        return ConfigurationException.throw`${extension} is not a valid ServerExtension`;
      }

      if (isFn(extension.processRequest)) {
        const handler = extension.processRequest.bind(extension);

        this.handlers.request.push(handler);

        if (isFn(extension.getRoutes)) {
          for (const { path, method } of await extension.getRoutes()) {
            const handlers = this.handlers.routes.getOrInsertComputed(
              path,
              () => new Map(),
            );

            if (method) {
              handlers.getOrInsertComputed(method, () => []).push(handler);
            } else {
              for (const method of HTTP_METHODS) {
                handlers.getOrInsertComputed(method, () => []).push(handler);
              }
            }
          }
        }
      }

      if (isFn(extension.processWebSocketEvent)) {
        this.handlers.websocket.push(extension.processWebSocketEvent.bind(extension));
      }
    }
  }

  @OnBoot()
  async startServer(): Promise<void> {
    if (this.server) {
      this.logger?.warn('Server already started');
      return;
    }

    if (!this.handlers.request.length) {
      this.logger?.warn('Server has no request handlers');
      return;
    }

    const { port, hostname } = this.config;

    const options: Partial<ServerOptions> = {
      port,
      hostname,
      fetch: (request, server) => this.processRequest(request, server),
    };

    if (this.handlers.routes.size) {
      const routes: ServerRoutes = {};

      for (const [path, methods] of this.handlers.routes.entries()) {
        for (const method of methods.keys()) {
          routes[path] ??= {};
          routes[path][method] = (request, server) =>
            this.processRequest(request, server, path);
        }
      }

      options.routes = routes;
    }

    if (this.handlers.websocket.length) {
      options.websocket = {
        ping: (socket, data) =>
          this.processWebSocketEvent({ name: 'ping', data }, socket),
        pong: (socket, data) =>
          this.processWebSocketEvent({ name: 'pong', data }, socket),
        open: (socket) => this.processWebSocketEvent({ name: 'open' }, socket),
        close: (socket, code, reason) =>
          this.processWebSocketEvent({ name: 'close', code, reason }, socket),
        drain: (socket) => this.processWebSocketEvent({ name: 'drain' }, socket),
        message: async (socket, data) => {
          if (Buffer.isBuffer(data)) {
            await this.processWebSocketEvent({ name: 'binary', data }, socket);
          } else if (isString(data)) {
            await this.processWebSocketEvent({ name: 'text', data }, socket);
          }
        },
      };
    }

    this.server = (this.factory ?? Bun.serve<unknown>)(options as ServerOptions);

    this.logger?.debug('Options', options);

    this.logger?.info(`Started on ${this.server.url}`);
  }

  @OnDestroy()
  async stopServer(): Promise<void> {
    if (!this.server) {
      this.logger?.warn('Server already stopped');
      return;
    }

    await this.server.stop(true);

    this.logger?.info('Stopped');
  }

  private async processRequest(
    request: ServerRequest,
    server: Server,
    path?: HttpPath,
  ): Promise<Response | undefined> {
    const requestId = Id.for('Request');

    const url = new URL(request.url);
    const method = request.method as HttpMethod;
    const query = extractQuery(url);
    const params = request.params ?? {};

    const logger = await this.container.tryResolveProvider(Logger, {
      requestId,
    });

    logger?.setContext('Request');

    const trace = logger?.trace();

    const context: RequestContext = {
      requestId,
      url,
      path,
      method,
      query,
      params,
      body: null,
      state: {},
      upgrade: (headers) => {
        const { requestId, url, path, method, query, params, state } = context;

        return server.upgrade(request, {
          headers,
          data: {
            requestId,
            url,
            path,
            method,
            query,
            params,
            state,
          },
        });
      },
    };

    let response: Response | undefined | null;

    try {
      if (path) {
        const handlers = this.handlers.routes.get(path)?.get(method);

        if (handlers) {
          for (const handler of handlers) {
            response = await handler(request, context);

            if (response !== undefined) {
              break;
            }
          }
        }
      }

      if (response === undefined) {
        if (this.handlers.request.length) {
          context.body = null;

          for (const handler of this.handlers.request) {
            response = await handler(request, context);

            if (response !== undefined) {
              break;
            }
          }
        }
      }
    } catch (err) {
      let exception: HttpException;
      if (HttpException.isInstance(err)) {
        exception = err;
        if (err.cause) {
          trace?.warn('Request error', err.cause);
        }
      } else {
        trace?.fatal('Unhandled error', err);

        exception = new HttpException('INTERNAL_SERVER_ERROR');
      }

      response = exception.toResponse();
    }

    if (response === null) {
      response = undefined;
    } else if (response === undefined) {
      response = new HttpException('NOT_FOUND').toResponse();
    } else if (!(response instanceof Response)) {
      response = new HttpException('NOT_IMPLEMENTED').toResponse();
    }

    const status = response?.status;

    trace?.debug(`${method} ${url.pathname}${status ? ` ${status}` : ''}`);

    await this.container.destroyRequest(requestId);

    return response;
  }

  private async processWebSocketEvent(
    event: WebSocketEvent,
    socket: ServerWebSocket,
  ): Promise<void> {
    try {
      for (const handler of this.handlers.websocket) {
        const result = await handler(event, socket);

        if (result) {
          break;
        }
      }
    } catch (err) {
      this.logger?.fatal('Unhandled error', err);
    }

    switch (event.name) {
      case 'close':
      case 'drain': {
        break;
      }
    }
  }
}
