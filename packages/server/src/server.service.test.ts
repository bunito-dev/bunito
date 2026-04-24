import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { Id } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { SERVER_EXTENSION } from './constants';
import { HttpException } from './exceptions';
import { ServerService } from './server.service';
import type { ServerOptions, ServerWebSocket } from './types';

describe('ServerService', () => {
  const createLogger = () => {
    const entries: unknown[] = [];

    return {
      entries,
      logger: {
        setContext: (context: unknown) => entries.push(['context', context]),
        warn: (message: string) => entries.push(['warn', message]),
        info: (message: string) => entries.push(['info', message]),
        fatal: (message: string, error: unknown) =>
          entries.push(['fatal', message, error]),
        trace: () => ({
          debug: (message: string) => entries.push(['debug', message]),
          fatal: (message: string, error: unknown) =>
            entries.push(['trace-fatal', message, error]),
        }),
      } as unknown as Logger,
    };
  };

  it('configures extensions, starts, routes requests, handles websockets, and stops', async () => {
    let options: ServerOptions | undefined;
    const socketEvents: string[] = [];
    const { logger, entries } = createLogger();
    const extension = {
      getRoutes: () => [
        {
          path: '/hello',
          method: 'GET' as const,
        },
        {
          path: '/any',
          method: null,
        },
      ],
      processRequest: async (context: { path?: string }) => {
        if (context.path === '/hello') {
          return new Response('hello');
        }

        return undefined;
      },
      processWebSocketEvent: (context: { event: { name: string } }) => {
        socketEvents.push(context.event.name);
      },
    };
    const container = {
      getExtensions: (key: symbol) =>
        key === SERVER_EXTENSION
          ? [
              {
                providerId: Id.for(extension),
                moduleId: Id.unique('Module'),
              },
            ]
          : [],
      resolveProvider: async () => extension,
      tryResolveProvider: async (token: unknown) =>
        token === Logger ? logger : undefined,
      destroyRequest: async () => {
        entries.push(['destroyRequest']);
      },
    };
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      container as never,
      ((serverOptions: ServerOptions) => {
        options = serverOptions;

        return {
          url: new URL('http://127.0.0.1:3000'),
          stop: async (force: boolean) => {
            entries.push(['stop', force]);
          },
        };
      }) as never,
      logger,
    );

    await service.configure();
    await service.startServer();
    await service.startServer();

    const capturedOptions = options as unknown as {
      fetch: (request: Request, server: unknown) => Promise<Response | undefined>;
      routes: Record<
        string,
        Record<
          string,
          (request: Request, server: unknown) => Promise<Response | undefined>
        >
      >;
      websocket: NonNullable<ServerOptions['websocket']>;
    };

    expect(capturedOptions.routes['/hello']?.GET).toBeFunction();
    expect(capturedOptions.routes['/any']?.GET).toBeFunction();
    expect(capturedOptions.websocket.open).toBeFunction();
    const helloHandler = capturedOptions.routes['/hello']?.GET;

    if (!helloHandler) {
      throw new Error('Expected /hello GET handler');
    }

    expect(
      await helloHandler(new Request('http://test/hello'), {}).then((response) =>
        response?.text(),
      ),
    ).toBe('hello');
    expect(
      await capturedOptions
        .fetch(new Request('http://test/missing'), {})
        .then((response) => response?.status),
    ).toBe(404);

    capturedOptions.websocket.open?.({ data: {} } as ServerWebSocket);
    await capturedOptions.websocket.ping?.(
      { data: {} } as ServerWebSocket,
      Buffer.from('ping'),
    );
    await capturedOptions.websocket.pong?.(
      { data: {} } as ServerWebSocket,
      Buffer.from('pong'),
    );
    capturedOptions.websocket.close?.({ data: {} } as ServerWebSocket, 1000, 'done');
    capturedOptions.websocket.drain?.({ data: {} } as ServerWebSocket);
    await capturedOptions.websocket.message?.({ data: {} } as ServerWebSocket, 'text');
    await capturedOptions.websocket.message?.(
      { data: {} } as ServerWebSocket,
      Buffer.from('binary'),
    );

    await service.stopServer();

    expect(socketEvents).toEqual([
      'open',
      'ping',
      'pong',
      'close',
      'drain',
      'text',
      'binary',
    ]);
    expect(entries).toContainEqual(['warn', 'Server already started']);
    expect(entries).toContainEqual(['info', 'Stopped']);
  });

  it('warns when started without request handlers and when stopped before start', async () => {
    const { logger, entries } = createLogger();
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      {
        getExtensions: () => [],
      } as never,
      null,
      logger,
    );

    await service.configure();
    await service.startServer();
    await service.stopServer();

    expect(entries).toContainEqual(['warn', 'Server has no request handlers']);
    expect(entries).toContainEqual(['warn', 'Server already stopped']);
  });

  it('rejects invalid extensions', async () => {
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      {
        getExtensions: () => [
          {
            providerId: Id.for('bad'),
            moduleId: Id.unique('Module'),
          },
        ],
        resolveProvider: async () => ({}),
      } as never,
      null,
      null,
    );

    await expect(service.configure()).rejects.toThrow(ConfigurationException);
  });

  it('normalizes request handler results and unhandled errors', async () => {
    const { logger, entries } = createLogger();
    const container = {
      tryResolveProvider: async () => logger,
      destroyRequest: async () => {
        entries.push(['destroyRequest']);
      },
    };
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      container as never,
      null,
      logger,
    );
    const handlers = (
      service as unknown as {
        handlers: {
          request: Array<() => unknown>;
        };
      }
    ).handlers;

    handlers.request.push(() => null);
    expect(
      await (
        service as unknown as {
          processRequest: (
            request: Request,
            server: unknown,
          ) => Promise<Response | undefined>;
        }
      ).processRequest(new Request('http://test/null'), {}),
    ).toBeUndefined();

    handlers.request = [() => 'plain-data'];
    expect(
      await (
        service as unknown as {
          processRequest: (
            request: Request,
            server: unknown,
          ) => Promise<Response | undefined>;
        }
      )
        .processRequest(new Request('http://test/plain'), {})
        .then((response) => response?.status),
    ).toBe(501);

    handlers.request = [
      () => {
        throw new HttpException('FORBIDDEN');
      },
    ];
    expect(
      await (
        service as unknown as {
          processRequest: (
            request: Request,
            server: unknown,
          ) => Promise<Response | undefined>;
        }
      )
        .processRequest(new Request('http://test/forbidden'), {})
        .then((response) => response?.status),
    ).toBe(403);

    handlers.request = [
      () => {
        throw new Error('boom');
      },
    ];
    expect(
      await (
        service as unknown as {
          processRequest: (
            request: Request,
            server: unknown,
          ) => Promise<Response | undefined>;
        }
      )
        .processRequest(new Request('http://test/error'), {})
        .then((response) => response?.status),
    ).toBe(500);
    expect(entries).toContainEqual(['trace-fatal', 'Unhandled error', expect.any(Error)]);
  });

  it('logs unhandled websocket handler errors and stops after the first handled event', async () => {
    const { logger, entries } = createLogger();
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      {} as never,
      null,
      logger,
    );
    const calls: string[] = [];
    (
      service as unknown as {
        handlers: {
          websocket: Array<(context: unknown) => unknown>;
        };
      }
    ).handlers.websocket = [
      () => {
        calls.push('first');
        return false;
      },
      () => {
        calls.push('second');
        throw new Error('boom');
      },
      () => {
        calls.push('third');
      },
    ];

    await (
      service as unknown as {
        processWebSocketEvent: (event: unknown, socket: ServerWebSocket) => Promise<void>;
      }
    ).processWebSocketEvent({ name: 'close' }, { data: {} } as ServerWebSocket);

    expect(calls).toEqual(['first', 'second']);
    expect(entries).toContainEqual(['fatal', 'Unhandled error', expect.any(Error)]);
  });
});
