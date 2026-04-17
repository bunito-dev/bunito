import { isFn } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import type { ProviderId } from '@bunito/container';
import { Container, Id, OnBoot, OnDestroy, OnInit, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import type { Serve, Server, ServerWebSocket } from 'bun';
import { serve } from 'bun';
import type { RouterExtension } from './router';
import { ROUTER_EXTENSION } from './router';
import { ServerConfig } from './server.config';
import type {
  FetchContext,
  FetchHandler,
  WebSocketContext,
  WebSocketData,
  WebSocketEvent,
  WebSocketHandler,
} from './types';

@Provider({
  scope: 'singleton',
  injects: [ServerConfig, Container, { token: Logger, optional: true }],
})
export class ServerService {
  private server: Server<unknown> | undefined;

  private readonly fetchHandlers: FetchHandler[] = [];

  private readonly websocketHandlers: WebSocketHandler[] = [];

  constructor(
    private readonly config: ResolveConfig<typeof ServerConfig>,
    private readonly container: Container,
    private readonly logger: Logger | null,
  ) {
    logger?.setContext(ServerService);
  }

  @OnInit()
  async configureRouters(): Promise<void> {
    const routers = this.container.getExtensions(ROUTER_EXTENSION);

    const providerIds = new WeakSet<ProviderId>();

    for (const { providerId, moduleId } of routers) {
      if (!providerId || providerIds.has(providerId)) {
        continue;
      }

      const router = await this.container.resolveProvider<RouterExtension>(providerId, {
        moduleId,
      });

      if (isFn(router.processFetchRequest)) {
        this.fetchHandlers.push(router.processFetchRequest.bind(router));
      }

      if (isFn(router.processWebSocketEvent)) {
        this.websocketHandlers.push(router.processWebSocketEvent.bind(router));
      }

      providerIds.add(providerId);
    }
  }

  @OnBoot()
  async startServer(): Promise<void> {
    if (this.server) {
      this.logger?.warn('Server already running');
      return;
    }

    const { port, hostname } = this.config;

    const options = {
      port,
      hostname,
      fetch: (request, server) => this.processFetchRequest(request, server),
    } as Serve.Options<WebSocketData>;

    if (this.websocketHandlers.length) {
      options.websocket = {
        ping: (socket, data) =>
          this.processWebSocketEvent({ name: 'ping', data }, socket),
        pong: (socket, data) =>
          this.processWebSocketEvent({ name: 'pong', data }, socket),
        message: (socket, data) =>
          this.processWebSocketEvent({ name: 'message', data }, socket),
        close: (socket, code, reason) =>
          this.processWebSocketEvent({ name: 'close', code, reason }, socket),
        open: (socket) => this.processWebSocketEvent({ name: 'open' }, socket),
        drain: (socket) => this.processWebSocketEvent({ name: 'drain' }, socket),
      };

      this.logger?.info('WebSockets ENABLED');
    }

    this.server = serve<WebSocketData>(options);

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

  private async processFetchRequest(
    request: Request,
    server: Server<WebSocketData>,
  ): Promise<Response | undefined> {
    let response: Response | null | undefined;

    const requestId = Id.unique('Request');

    const logger = await this.container.tryResolveProvider(Logger, {
      requestId,
    });

    logger?.setContext('Request');

    const url = new URL(request.url);
    const data: Record<string, unknown> = {};

    const context: FetchContext = {
      requestId,
      url,
      data,
      logger,
      upgrade: (headers) => {
        server.upgrade(request, {
          headers,
          data: {
            data,
            url,
          },
        });
        return false;
      },
    };

    const trace = logger?.trace();

    try {
      for (const fetchHandler of this.fetchHandlers) {
        const maybeResponse = await fetchHandler(request, context);

        if (maybeResponse instanceof Response) {
          response = maybeResponse;
          break;
        }

        if (maybeResponse === true) {
          response = null;
          break;
        }
      }
    } catch (err) {
      trace?.fatal('Unhandled Error', err);

      response = new Response('Internal Server Error', { status: 500 });
    }

    if (response === undefined) {
      response = new Response('Not Implemented', { status: 501 });
    }

    trace?.debug(
      `${request.method} ${url.pathname}${response ? ` ${response.status}` : ''}`,
    );

    await this.container.cleanup(requestId);

    return response ?? undefined;
  }

  private async processWebSocketEvent(
    event: WebSocketEvent,
    socket: ServerWebSocket<WebSocketData>,
  ): Promise<void> {
    const { url, data } = socket.data;
    let { logger, connectionId } = socket.data;

    if (!connectionId) {
      connectionId = Id.unique('Connection');

      logger = await this.container.resolveProvider(Logger, {
        requestId: connectionId,
      });
    }

    const context: WebSocketContext = {
      connectionId,
      socket,
      data,
      logger,
      url,
    };

    for (const handler of this.websocketHandlers) {
      try {
        if ((await handler(event, context)) === true) {
          break;
        }
      } catch (err) {
        logger?.fatal('Unhandled Error', err);
      }
    }

    switch (event.name) {
      case 'close':
      case 'drain': {
        await this.container.cleanup(connectionId);
        break;
      }
    }
  }
}
