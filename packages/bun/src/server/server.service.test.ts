import { describe, expect, it } from 'bun:test';
import { Buffer } from 'node:buffer';
import type { Logger } from '@bunito/logger';
import type { ServerRouter } from './router';
import { ServerException } from './server.exception';
import { ServerService } from './server.service';
import type { RequestContext, Server, ServerOptions, WebSocketEvent } from './types';

type CapturedServe = {
  options?: ServerOptions;
  server: Server;
  stopped: boolean;
  stopImmediately?: boolean;
};

function createServeCapture(): CapturedServe & {
  factory: typeof Bun.serve;
} {
  const capture = {
    stopped: false,
  } as CapturedServe & {
    factory: typeof Bun.serve;
  };

  capture.server = {
    url: new URL('http://127.0.0.1:3000'),
    stop: async (immediately?: boolean) => {
      capture.stopped = true;
      capture.stopImmediately = immediately;
    },
  } as Server;
  capture.factory = ((options: ServerOptions) => {
    capture.options = options;
    return capture.server;
  }) as typeof Bun.serve;

  return capture as CapturedServe & {
    factory: typeof Bun.serve;
  };
}

function createLogger() {
  const logs: string[] = [];
  const errors: unknown[] = [];

  return {
    logs,
    errors,
    logger: {
      setContext: (context: unknown) => logs.push(`context:${String(context)}`),
      warn: (message: string) => logs.push(`warn:${message}`),
      debug: (message: string) => logs.push(`debug:${message}`),
      fatal: (message: string, error?: unknown) => {
        logs.push(`fatal:${message}`);
        errors.push(error);
      },
    } as unknown as Logger,
  };
}

async function read(response: Response | undefined): Promise<{
  status: number;
  body: string;
}> {
  expect(response).toBeInstanceOf(Response);

  return {
    status: response?.status ?? 0,
    body: response ? await response.text() : '',
  };
}

describe('ServerService', () => {
  it('rejects missing routers and sets logger context', () => {
    const { logger, logs } = createLogger();

    expect(() => {
      new ServerService(
        {
          port: 3000,
          hostname: '127.0.0.1',
        },
        null,
        [],
      );
    }).toThrow('No server routers found');

    new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      logger,
      [
        {
          processRequest: () => undefined,
        },
      ],
    );

    expect(logs[0]).toContain('ServerService');
  });

  it('starts, routes async requests, reports missing routes, and stops', async () => {
    const capture = createServeCapture();
    const { logger, logs } = createLogger();
    const routeRouter: ServerRouter = {
      getRoutePaths: async () => ['/users/:id'],
      processRequest: async (request, context) => {
        if (!context.route) {
          return;
        }

        expect((request as Request & { params?: Record<string, string> }).params).toEqual(
          {
            id: '42',
          },
        );
        expect(context.route).toEqual({
          path: '/users/:id',
          method: 'GET',
          params: {
            id: '42',
          },
        });

        return new Response('user');
      },
    };
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      logger,
      [routeRouter],
      capture.factory,
    );

    await service.startServer();
    await service.startServer();

    const routeRequest = new Request('http://localhost/users/42') as Request & {
      params?: Record<string, string>;
    };
    routeRequest.params = {
      id: '42',
    };
    const routeResponse = await (
      capture.options?.routes?.['/users/:id'] as (
        request: Request,
        server: Server,
      ) => Response | Promise<Response>
    )(routeRequest, capture.server);
    const missingResponse = await (capture.options?.fetch?.call(
      capture.server,
      new Request('http://localhost/missing', {
        method: 'POST',
      }),
      capture.server,
    ) as Response | Promise<Response | undefined> | undefined);

    expect(capture.options?.port).toBe(3000);
    expect(capture.options?.hostname).toBe('127.0.0.1');
    expect(await read(routeResponse)).toEqual({
      status: 200,
      body: 'user',
    });
    expect(await read(missingResponse)).toEqual({
      status: 404,
      body: 'Not Found',
    });
    expect(logs).toContain('warn:Server already started');
    expect(logs).toContain(
      'warn:No matching router found for POST http://localhost/missing',
    );

    await service.stopServer();
    await service.stopServer();

    expect(capture.stopped).toBeTrue();
    expect(capture.stopImmediately).toBeTrue();
    expect(logs).toContain('warn:Server already stopped');
  });

  it('passes unhandled serve errors through the logger', async () => {
    const capture = createServeCapture();
    const { logger, logs, errors } = createLogger();
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      logger,
      [
        {
          processRequest: () => new Response('ok'),
        },
      ],
      capture.factory,
    );

    await service.startServer();

    const error = new Error('Boom');
    const response = capture.options?.error?.call(capture.server, error) as
      | Response
      | undefined;

    expect(await read(response)).toEqual({
      status: 500,
      body: 'Internal Server Error',
    });
    expect(logs).toContain('fatal:Unhandled error');
    expect(errors).toContain(error);
  });

  it('rejects invalid router responses and unsupported upgrades', async () => {
    const invalidCapture = createServeCapture();
    const invalidService = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      null,
      [
        {
          processRequest: () => 'invalid' as never,
        },
      ],
      invalidCapture.factory,
    );

    await invalidService.startServer();

    let invalidResponseError: unknown;
    try {
      await invalidCapture.options?.fetch?.call(
        invalidCapture.server,
        new Request('http://localhost'),
        invalidCapture.server,
      );
    } catch (error) {
      invalidResponseError = error;
    }

    const upgradeCapture = createServeCapture();
    const upgradeService = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      null,
      [
        {
          processRequest: (_request: Request, context: RequestContext) => {
            context.upgrade();
          },
        },
      ],
      upgradeCapture.factory,
    );

    await upgradeService.startServer();

    let upgradeError: unknown;
    try {
      await upgradeCapture.options?.fetch?.call(
        upgradeCapture.server,
        new Request('http://localhost'),
        upgradeCapture.server,
      );
    } catch (error) {
      upgradeError = error;
    }

    expect(invalidResponseError).toBeInstanceOf(ServerException);
    expect(upgradeError).toBeInstanceOf(ServerException);
    expect((upgradeError as Error).message).toBe('Upgrade not supported');
  });

  it('upgrades websocket requests and dispatches websocket events', async () => {
    const capture = createServeCapture();
    const events: WebSocketEvent[] = [];
    const socket = {} as Bun.ServerWebSocket<unknown>;
    let upgraded:
      | {
          request: Request;
          options?: {
            data?: unknown;
            headers?: HeadersInit;
          };
        }
      | undefined;
    const server = {
      upgrade: (
        request: Request,
        options?: {
          data?: unknown;
          headers?: HeadersInit;
        },
      ) => {
        upgraded = {
          request,
          options,
        };
        return true;
      },
    } as Server;
    const routeRouter: ServerRouter = {
      getRoutePaths: () => ['/ws'],
      processRequest: (_request, context) => {
        context.upgrade({
          headers: {
            'x-test': '1',
          },
          userId: '42',
        });
      },
    };
    const firstWebSocketRouter: ServerRouter = {
      processRequest: () => undefined,
      processWebSocketEvent: async (event) => {
        events.push(event);
        return event.name === 'text' ? false : undefined;
      },
    };
    const secondWebSocketRouter: ServerRouter = {
      processRequest: () => undefined,
      processWebSocketEvent: async (event) => {
        events.push(event);
        return undefined;
      },
    };
    const service = new ServerService(
      {
        port: 3000,
        hostname: '127.0.0.1',
      },
      null,
      [routeRouter, firstWebSocketRouter, secondWebSocketRouter],
      ((options: ServerOptions) => {
        capture.options = options;
        return capture.server;
      }) as typeof Bun.serve,
    );

    await service.startServer();

    const request = new Request('http://localhost/ws');
    const response = await (
      capture.options?.routes?.['/ws'] as (
        request: Request,
        server: Server,
      ) => Response | undefined | Promise<Response | undefined>
    )(request, server);
    await capture.options?.websocket?.open?.(socket);
    await capture.options?.websocket?.close?.(socket, 1000, 'done');
    await capture.options?.websocket?.ping?.(socket, Buffer.from('ping'));
    await capture.options?.websocket?.pong?.(socket, Buffer.from('pong'));
    await capture.options?.websocket?.drain?.(socket);
    await capture.options?.websocket?.message?.(socket, 'hello');
    await capture.options?.websocket?.message?.(socket, Buffer.from('bytes'));

    expect(response).toBeUndefined();
    expect(upgraded?.request).toBe(request);
    expect(upgraded?.options).toEqual({
      data: {
        userId: '42',
      },
      headers: {
        'x-test': '1',
      },
    });
    expect(events.map((event) => event.name)).toEqual([
      'open',
      'open',
      'close',
      'close',
      'ping',
      'ping',
      'pong',
      'pong',
      'drain',
      'drain',
      'text',
      'binary',
      'binary',
    ]);
  });
});
