import { Buffer } from 'node:buffer';
import { OnAppShutdown, OnAppStart } from '@bunito/app';
import { InternalException, isFn } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Container, optional, Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { BunServerConfig } from './bun-server.config';
import { BunServerRouter } from './bun-server-router';
import { BUN_SERVER_FACTORY_ID } from './constants';
import type {
  BunRequest,
  BunServer,
  BunServerFactory,
  BunServerOptions,
  HTTPMethod,
  RequestContext,
  WebSocketEvent,
} from './types';

@Provider({
  injects: [
    BunServerConfig,
    optional(Logger),
    Container,
    optional(BUN_SERVER_FACTORY_ID, Bun.serve),
    optional(BunServerRouter),
  ],
})
export class BunServerService {
  private server: Bun.Server<unknown> | undefined;

  private readonly routerRoles: {
    route?: Map<string, BunServerRouter[]>;
    websocket?: BunServerRouter[];
  } = {};

  constructor(
    private readonly config: ResolveConfig<typeof BunServerConfig>,
    private readonly logger: Logger | null,
    private readonly container: Container,
    private readonly serverFactory: BunServerFactory,
    private readonly routers: BunServerRouter[],
  ) {
    if (!routers?.length) {
      InternalException.throw`No server routers were found`;
    }
  }

  @OnAppStart()
  async startServer(): Promise<void> {
    if (this.server) {
      this.logger?.warn('Server already started');
      return;
    }

    const { port, hostname } = this.config;
    const routers = this.routers;

    const options = {
      port,
      hostname,
    } as Bun.Serve.Options<unknown>;

    options.fetch = (request, server) => this.processRequest(request, server);

    for (const router of routers) {
      if (isFn(router.getRoutePaths)) {
        for (const routePath of await router.getRoutePaths()) {
          options.routes ??= {};
          options.routes[routePath] ??= (request, server) =>
            this.processRequest(request, server, routePath);

          this.routerRoles.route ??= new Map();
          this.routerRoles.route?.getOrInsertComputed(routePath, () => []).push(router);
        }
      }

      if (isFn(router.processWebSocketEvent)) {
        this.routerRoles.websocket ??= [];
        this.routerRoles.websocket.push(router);
      }
    }

    if (this.routerRoles.websocket) {
      options.websocket = this.createWebSocketOption();
    }

    this.server = this.serverFactory({
      ...options,
      error: (error) => {
        this.logger?.fatal('Unhandled error', error);

        return new Response('Internal Server Error', {
          status: 500,
        });
      },
    });

    const url = this.server?.url?.toString() ?? 'unknown';

    this.logger?.info(`Server started: ${url}`);
  }

  @OnAppShutdown()
  async stopServer(): Promise<void> {
    if (!this.server) {
      this.logger?.warn('Server already stopped');
      return;
    }

    await this.server.stop(true);
    this.logger?.info('Server stopped');

    this.server = undefined;
    this.routerRoles.route = undefined;
    this.routerRoles.websocket = undefined;
  }

  private async processRequest(
    request: BunRequest,
    server: BunServer,
    routePath?: string,
  ): Promise<Response | undefined> {
    const routers = routePath ? this.routerRoles.route?.get(routePath) : this.routers;

    if (!routers?.length) {
      this.logger?.warn(`No matching router found for ${request.method} ${request.url}`);

      return new Response('Not Found', {
        status: 404,
      });
    }

    let upgraded = false;

    const context: RequestContext = {
      route: routePath
        ? {
            path: routePath,
            method: request.method as HTTPMethod,
            params: request.params ?? {},
          }
        : undefined,
      upgrade: (options?) => {
        const { headers, ...data } = options ?? {};

        if (upgraded) {
          return InternalException.throw`Request has already been upgraded`;
        }

        if (!this.routerRoles.websocket) {
          return InternalException.throw`WebSocket upgrade is not supported`;
        }

        upgraded = server.upgrade(request, {
          data,
          headers,
        });

        return upgraded;
      },
    };

    return await this.container.runInRequestContext(async () => {
      let response: Response | undefined;

      const logger = await this.container.resolveProvider(Logger, {
        context: BunServerService,
      });

      const logPrefix = `${request.method} ${request.url}`;

      for (const router of routers) {
        if (!isFn(router.processRequest)) {
          continue;
        }

        const output = await router.processRequest(request, context);

        if (output instanceof Response) {
          response = output;
          break;
        }

        if (output !== undefined) {
          return InternalException.throw`Router ${router} returned an invalid response`;
        }

        if (upgraded) {
          logger?.debug(`${logPrefix} UPGRADED`);
          return;
        }
      }

      if (!response) {
        response = new Response('Not Found', {
          status: 404,
        });
      }

      logger?.debug(`${logPrefix} ${response.status}`);

      return response;
    });
  }

  private async processWebSocketEvent(
    event: WebSocketEvent,
    socket: Bun.ServerWebSocket<unknown>,
  ): Promise<void> {
    if (!this.routerRoles.websocket) {
      return;
    }

    const routers = this.routerRoles.websocket;

    await this.container.runInRequestContext(async () => {
      const logger = await this.container.resolveProvider(Logger);

      for (const router of routers) {
        if (!isFn(router.processWebSocketEvent)) {
          continue;
        }

        const output = await router.processWebSocketEvent(event, socket);

        if (output !== undefined) {
          break;
        }
      }

      logger?.debug(`WebSocket ${event.name} event processed`);
    });
  }

  private createWebSocketOption(): BunServerOptions['websocket'] {
    return {
      open: (socket) => {
        return this.processWebSocketEvent({ name: 'open' }, socket);
      },
      close: (socket, code, reason) => {
        return this.processWebSocketEvent({ name: 'close', code, reason }, socket);
      },
      ping: (socket, data) => {
        return this.processWebSocketEvent({ name: 'ping', data }, socket);
      },
      pong: (socket, data) => {
        return this.processWebSocketEvent({ name: 'pong', data }, socket);
      },
      drain: (socket) => {
        return this.processWebSocketEvent({ name: 'drain' }, socket);
      },
      message: (socket, data) => {
        return this.processWebSocketEvent(
          Buffer.isBuffer(data)
            ? {
                name: 'binary',
                data,
              }
            : {
                name: 'text',
                data,
              },
          socket,
        );
      },
    };
  }
}
