import { Buffer } from 'node:buffer';
import type { Fn } from '@bunito/common';
import { ConfigurationException, isFn, isObject, isString } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Container, Id, OnBoot, OnDestroy, OnInit, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { HTTP_METHODS, SERVER_EXTENSION, SERVER_FACTORY_ID } from './constants';
import { RequestContext, WebSocketContext } from './contexts';
import { HttpException } from './exceptions';
import { ServerConfig } from './server.config';
import type { ServerExtension } from './server.extension';
import type {
  HttpMethod,
  HttpPath,
  RequestHandler,
  Server,
  ServerFactory,
  ServerOptions,
  ServerRoutes,
  ServerWebSocket,
  WebSocketEvent,
  WebSocketHandler,
} from './types';

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
    request: Request,
    server: Server,
    routePath?: HttpPath,
  ): Promise<Response | undefined> {
    const requestId = Id.unique('Request');

    const logger = await this.container.tryResolveProvider(Logger, {
      requestId,
    });

    logger?.setContext('Request');

    const trace = logger?.trace();

    const context = new RequestContext(requestId, request, routePath, server, trace);

    let response: Response | undefined | null;
    let exception: HttpException | undefined;

    const usedHandlers = new WeakSet<Fn>();

    try {
      if (routePath) {
        const handlers = this.handlers.routes.get(routePath)?.get(context.method);

        if (handlers) {
          for (const handler of handlers) {
            if (usedHandlers.has(handler)) {
              continue;
            }

            usedHandlers.add(handler);

            response = await handler(context);

            if (response !== undefined) {
              break;
            }
          }
        }
      }

      if (response === undefined) {
        if (this.handlers.request.length) {
          for (const handler of this.handlers.request) {
            if (usedHandlers.has(handler)) {
              continue;
            }

            usedHandlers.add(handler);

            response = await handler(context);

            if (response !== undefined) {
              break;
            }
          }
        }
      }
    } catch (err) {
      if (HttpException.isInstance(err)) {
        exception = err;
      } else {
        trace?.fatal('Unhandled error', err);

        exception = new HttpException('INTERNAL_SERVER_ERROR');
      }
    }

    if (response === null) {
      response = undefined;
    } else if (!exception) {
      if (response === undefined) {
        exception = new HttpException('NOT_FOUND');
      } else if (!(response instanceof Response)) {
        exception = new HttpException('NOT_IMPLEMENTED');
      }
    }

    if (exception) {
      response = exception.toResponse();
    }

    const status = response?.status;

    trace?.debug(`${request.method} ${request.url}${status ? ` ${status}` : ''}`);

    await this.container.destroyRequest(requestId);

    return response;
  }

  private async processWebSocketEvent(
    event: WebSocketEvent,
    socket: ServerWebSocket,
  ): Promise<void> {
    const context = new WebSocketContext(event, socket);

    const usedHandlers = new WeakSet<Fn>();

    try {
      for (const handler of this.handlers.websocket) {
        if (usedHandlers.has(handler)) {
          continue;
        }

        usedHandlers.add(handler);

        const result = await handler(context);

        if (result !== false) {
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
