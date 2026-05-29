import { describe, expect, it, mock } from 'bun:test';
import { Buffer } from 'node:buffer';
import { InternalException } from '@bunito/common';
import type { Container } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { mockClass } from '@bunito/testing';
import { BunServerService } from './bun-server.service';
import type { BunServerRouter } from './bun-server-router';
import type {
  BunServer,
  BunServerOptions,
  RequestContext,
  WebSocketEvent,
} from './types';

type CapturedServe = {
  options?: BunServerOptions;
  server: BunServer;
  stopped: boolean;
  stopImmediately?: boolean;
  factory: typeof Bun.serve;
};

type PrivateServerService = {
  processRequest: (
    request: Request,
    server: BunServer,
    routePath?: string,
  ) => Promise<Response | undefined>;
  processWebSocketEvent: (
    event: WebSocketEvent,
    socket: Bun.ServerWebSocket<unknown>,
  ) => Promise<void>;
};

function createServeCapture(): CapturedServe {
  const capture = {
    stopped: false,
  } as CapturedServe;

  capture.server = {
    url: new URL('http://127.0.0.1:3000'),
    stop: mock(async (immediately?: boolean) => {
      capture.stopped = true;
      capture.stopImmediately = immediately;
    }),
  } as unknown as BunServer;
  capture.factory = ((options: BunServerOptions) => {
    capture.options = options;
    return capture.server;
  }) as typeof Bun.serve;

  return capture;
}

function createLogger() {
  return mockClass(Logger);
}

function createContainer(logger: Logger | null = createLogger() as unknown as Logger) {
  return {
    runInRequestContext: mock((handler: () => Promise<unknown>) => handler()),
    resolveProvider: mock(async () => logger),
  } as unknown as Container;
}

function createService(
  routers: BunServerRouter[],
  options: {
    capture?: CapturedServe;
    logger?: Logger | null;
    container?: Container;
  } = {},
): BunServerService {
  const capture = options.capture ?? createServeCapture();
  const logger = options.logger ?? (createLogger() as unknown as Logger);
  const container = options.container ?? createContainer(logger);

  return new BunServerService(
    {
      port: 3000,
      hostname: '127.0.0.1',
    },
    logger,
    container,
    capture.factory,
    routers,
  );
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
  it('rejects missing routers', () => {
    expect(() => {
      createService([]);
    }).toThrow('No server routers were found');
  });

  it('starts, routes requests, reports missing routes, and stops', async () => {
    const capture = createServeCapture();
    const logger = createLogger() as unknown as Logger;
    const routeRouter: BunServerRouter = {
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
    const fallbackRouter = {
      processRequest: undefined,
    } as unknown as BunServerRouter;
    const service = createService([fallbackRouter, routeRouter], {
      capture,
      logger,
    });

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
        server: BunServer,
      ) => Response | Promise<Response>
    )(routeRequest, capture.server);
    const missingResponse = (await capture.options?.fetch?.call(
      capture.server,
      new Request('http://localhost/missing', {
        method: 'POST',
      }),
      capture.server,
    )) as Response | undefined;

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
    expect(logger.warn).toHaveBeenCalledWith('Server already started');
    expect(logger.debug).toHaveBeenCalledWith('POST http://localhost/missing 404');

    await service.stopServer();
    await service.stopServer();

    expect(capture.stopped).toBeTrue();
    expect(capture.stopImmediately).toBeTrue();
    expect(logger.info).toHaveBeenCalledWith('Server stopped');
    expect(logger.warn).toHaveBeenCalledWith('Server already stopped');
  });

  it('passes unhandled serve errors through the logger', async () => {
    const capture = createServeCapture();
    const logger = createLogger() as unknown as Logger;
    const service = createService(
      [
        {
          processRequest: () => new Response('ok'),
        },
      ],
      {
        capture,
        logger,
      },
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
    expect(logger.fatal).toHaveBeenCalledWith('Unhandled error', error);
  });

  it('rejects invalid router responses and unsupported upgrades', async () => {
    const invalidCapture = createServeCapture();
    const invalidService = createService(
      [
        {
          processRequest: () => 'invalid' as never,
        },
      ],
      {
        capture: invalidCapture,
      },
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
    const upgradeService = createService(
      [
        {
          processRequest: (_request: Request, context: RequestContext) => {
            context.upgrade();
          },
        },
      ],
      {
        capture: upgradeCapture,
      },
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

    expect(invalidResponseError).toBeInstanceOf(InternalException);
    expect((invalidResponseError as Error).message).toContain(
      'returned an invalid response',
    );
    expect(upgradeError).toBeInstanceOf(InternalException);
    expect((upgradeError as Error).message).toBe('WebSocket upgrade is not supported');
  });

  it('rejects duplicate websocket upgrades', async () => {
    const capture = createServeCapture();
    const service = createService(
      [
        {
          getRoutePaths: () => ['/ws'],
          processRequest: (_request, context) => {
            context.upgrade();
            context.upgrade();
          },
        },
        {
          processRequest: () => undefined,
          processWebSocketEvent: () => undefined,
        },
      ],
      {
        capture,
      },
    );

    await service.startServer();

    let error: unknown;

    try {
      await (
        capture.options?.routes?.['/ws'] as (
          request: Request,
          server: BunServer,
        ) => Response | undefined | Promise<Response | undefined>
      )(new Request('http://localhost/ws'), {
        upgrade: () => true,
      } as unknown as BunServer);
    } catch (cause) {
      error = cause;
    }

    expect(error).toBeInstanceOf(InternalException);
    expect((error as Error).message).toBe('Request has already been upgraded');
  });

  it('upgrades websocket requests and dispatches websocket events', async () => {
    const capture = createServeCapture();
    const logger = createLogger() as unknown as Logger;
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
    } as BunServer;
    const routeRouter: BunServerRouter = {
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
    const firstWebSocketRouter: BunServerRouter = {
      processRequest: () => undefined,
      processWebSocketEvent: async (event) => {
        events.push(event);

        return event.name === 'text' ? false : undefined;
      },
    };
    const secondWebSocketRouter: BunServerRouter = {
      processRequest: () => undefined,
      processWebSocketEvent: async (event) => {
        events.push(event);
      },
    };
    const service = createService(
      [routeRouter, firstWebSocketRouter, secondWebSocketRouter],
      {
        capture,
        logger,
      },
    );

    await service.startServer();

    const request = new Request('http://localhost/ws');
    const response = await (
      capture.options?.routes?.['/ws'] as (
        request: Request,
        server: BunServer,
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
    expect(logger.debug).toHaveBeenCalledWith('GET http://localhost/ws UPGRADED');
    expect(logger.debug).toHaveBeenCalledWith('WebSocket binary event processed');
  });

  it('returns early when websocket events are not configured', async () => {
    const service = createService([
      {
        processRequest: () => new Response('ok'),
      },
    ]) as unknown as PrivateServerService;

    await service.processWebSocketEvent(
      { name: 'open' },
      {} as Bun.ServerWebSocket<unknown>,
    );

    expect(true).toBeTrue();
  });

  it('returns not found for unknown compiled route buckets', async () => {
    const logger = createLogger() as unknown as Logger;
    const service = createService([
      {
        processRequest: () => new Response('ok'),
      },
    ]) as unknown as PrivateServerService;

    const response = await service.processRequest(
      new Request('http://localhost/private', {
        method: 'PATCH',
      }),
      createServeCapture().server,
      '/unknown',
    );

    expect(await read(response)).toEqual({
      status: 404,
      body: 'Not Found',
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
