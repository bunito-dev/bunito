import { Buffer } from 'node:buffer';
import { OnAppShutdown, OnAppStart } from '@bunito/app';
import { isFn } from '@bunito/common';
import type { ResolveConfig } from '@bunito/config';
import { Provider } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { SERVER_FACTORY_ID } from './constants';
import { ServerRouter } from './router';
import { ServerConfig } from './server.config';
import { ServerException } from './server.exception';
import type {
  HTTPMethod,
  RequestContext,
  Server,
  ServerOptions,
  ServerRequest,
  WebSocketEvent,
} from './types';

@Provider({
  injects: [
    ServerConfig,
    {
      useToken: Logger,
      optional: true,
    },
    {
      useToken: ServerRouter,
      optional: true,
    },
    {
      useToken: SERVER_FACTORY_ID,
      optional: true,
    },
  ],
})
export class ServerService {
  private server: Bun.Server<unknown> | undefined;

  private readonly routerRoles: {
    route?: Map<string, ServerRouter[]>;
    websocket?: ServerRouter[];
  } = {};

  constructor(
    private readonly config: ResolveConfig<typeof ServerConfig>,
    private readonly logger: Logger | null,
    private readonly routers: ServerRouter[],
    private readonly serverFactory: typeof Bun.serve | null = null,
  ) {
    if (!routers?.length) {
      ServerException.throw`No server routers found`;
    }

    logger?.setContext(ServerService);
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

    this.server = (this.serverFactory ?? Bun.serve)({
      ...options,
      error: (error) => {
        this.logger?.fatal('Unhandled error', error);

        return new Response('Internal Server Error', {
          status: 500,
        });
      },
    });

    this.logger?.debug(`Server started: ${this.server.url.toString()}`);
  }

  @OnAppShutdown()
  async stopServer(): Promise<void> {
    if (!this.server) {
      this.logger?.warn('Server already stopped');
      return;
    }

    await this.server.stop(true);
    this.logger?.debug('Server stopped');

    this.server = undefined;
    this.routerRoles.route = undefined;
    this.routerRoles.websocket = undefined;
  }

  private async processRequest(
    request: ServerRequest,
    server: Server,
    routePath?: string,
  ): Promise<Response | undefined> {
    const routers = routePath ? this.routerRoles.route?.get(routePath) : this.routers;

    let response: Response | undefined | null;

    if (routers) {
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

          if (!this.routerRoles.websocket) {
            return ServerException.throw`Upgrade not supported`;
          }

          response = null;

          return server.upgrade(request, {
            data,
            headers,
          });
        },
      };

      for (const router of routers) {
        if (!isFn(router.processRequest)) {
          continue;
        }

        const output = await router.processRequest(request, context);

        if (output instanceof Response) {
          return output;
        }

        if (response === null) {
          break;
        }

        if (output !== undefined) {
          return ServerException.throw`Router ${router} returned invalid response`;
        }
      }
    }

    if (response === undefined) {
      this.logger?.warn(`No matching router found for ${request.method} ${request.url}`);

      return new Response('Not Found', {
        status: 404,
      });
    }

    return response ?? undefined;
  }

  private async processWebSocketEvent(
    event: WebSocketEvent,
    socket: Bun.ServerWebSocket<unknown>,
  ): Promise<void> {
    if (!this.routerRoles.websocket) {
      return;
    }

    for (const router of this.routerRoles.websocket) {
      if (!isFn(router.processWebSocketEvent)) {
        continue;
      }

      const output = await router.processWebSocketEvent(event, socket);

      if (output !== undefined) {
        break;
      }
    }
  }

  private createWebSocketOption(): ServerOptions['websocket'] {
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
