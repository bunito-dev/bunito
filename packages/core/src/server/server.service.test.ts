import { describe, expect, it } from 'bun:test';
import { randomBytes } from 'node:crypto';
import { Socket } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { Id } from '../container';
import { Logger } from '../logger';
import { ROUTER_EXTENSION } from './routers';

type TestServerService = {
  processFetchRequest(
    request: Request,
    server: { upgrade: (request: Request, options: unknown) => boolean },
  ): Promise<Response | undefined>;
  processWebSocketEvent(
    event: unknown,
    socket: {
      data: {
        url: URL;
        data: Record<string, unknown>;
        connectionId?: Id;
        logger?: unknown;
      };
    },
  ): Promise<void>;
};

function createClientFrame(opcode: number, payload: Buffer): Buffer {
  const mask = randomBytes(4);
  const maskedPayload = Buffer.alloc(payload.length);

  for (let index = 0; index < payload.length; index += 1) {
    maskedPayload[index] = payload.readUInt8(index) ^ mask.readUInt8(index % mask.length);
  }

  return Buffer.concat([
    Buffer.from([0x80 | opcode, 0x80 | payload.length]),
    mask,
    maskedPayload,
  ]);
}

async function openRawWebSocket(url: URL): Promise<Socket> {
  const socket = new Socket();

  await new Promise<void>((resolve, reject) => {
    socket.once('error', reject);
    socket.connect(Number(url.port), url.hostname, () => {
      socket.off('error', reject);
      resolve();
    });
  });

  const key = randomBytes(16).toString('base64');

  socket.write(
    [
      `GET ${url.pathname} HTTP/1.1`,
      `Host: ${url.host}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${key}`,
      'Sec-WebSocket-Version: 13',
      '',
      '',
    ].join('\r\n'),
  );

  const response = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    const onData = (chunk: Buffer) => {
      chunks.push(chunk);

      const text = Buffer.concat(chunks).toString('utf8');

      if (text.includes('\r\n\r\n')) {
        socket.off('data', onData);
        socket.off('error', reject);
        resolve(text);
      }
    };

    socket.on('data', onData);
    socket.once('error', reject);
  });

  expect(response).toContain('101 Switching Protocols');
  socket.on('data', () => undefined);

  return socket;
}

async function waitFor(assertion: () => void): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await sleep(10);
    }
  }

  throw lastError;
}

describe('ServerService', () => {
  describe('configureRouters', () => {
    it('configures routers, starts and stops the server, and processes fetch and websocket events', async () => {
      const upgradeCalls: unknown[] = [];
      const logs: string[] = [];
      const routerEvents: string[] = [];

      const { ServerService } = await import(`./server.service.ts?test=${Date.now()}`);

      const requestLogger = {
        setContext: (value: unknown) => {
          logs.push(`request-context:${String(value)}`);
        },
        trace: () => ({
          fatal: (message: string) => {
            logs.push(`fatal:${message}`);
          },
          error: () => undefined,
          warn: () => undefined,
          info: () => undefined,
          ok: () => undefined,
          verbose: () => undefined,
          debug: (value: string) => {
            logs.push(`trace:${value}`);
            return value;
          },
        }),
        fatal: (message: string) => {
          logs.push(`fatal:${message}`);
        },
      };

      const appLogger = {
        setContext: () => undefined,
        info: (message: string) => {
          logs.push(`info:${message}`);
        },
        warn: (message: string) => {
          logs.push(`warn:${message}`);
        },
      };

      const routerProviderId = Id.for('router-provider');
      const router = {
        processFetchRequest: async (
          request: Request,
          context: { upgrade: () => boolean },
        ) => {
          switch (new URL(request.url).pathname) {
            case '/handled':
              return new Response('handled', { status: 200 });
            case '/upgrade':
              return context.upgrade();
            case '/skip':
              return true;
            case '/error':
              throw new Error('boom');
            default:
              return undefined;
          }
        },
        processWebSocketEvent: async (
          event: { name: string },
          context: {
            connectionId: Id;
            socket?: { send: (data: string) => unknown };
          },
        ) => {
          routerEvents.push(`${event.name}:${context.connectionId}`);

          if (event.name === 'message' && context.socket) {
            for (let index = 0; index < 64; index += 1) {
              context.socket.send('x'.repeat(64 * 1024));
            }
          }

          return event.name === 'message' ? true : undefined;
        },
      };

      const cleanupCalls: Id[] = [];
      const resolveCalls: unknown[] = [];
      const container = {
        getExtensions: (key: symbol) => {
          expect(key).toBe(ROUTER_EXTENSION);

          return [
            {
              providerId: routerProviderId,
              moduleId: Id.for('module'),
              options: undefined,
            },
            {
              providerId: routerProviderId,
              moduleId: Id.for('module'),
              options: undefined,
            },
          ];
        },
        resolveProvider: async (token: unknown, options?: unknown) => {
          resolveCalls.push([token, options]);
          return token === routerProviderId ? router : requestLogger;
        },
        tryResolveProvider: async () => requestLogger,
        cleanup: async (id: Id) => {
          cleanupCalls.push(id);
        },
      };

      const service = new ServerService(
        { port: 0, hostname: '127.0.0.1' },
        container as never,
        appLogger as never,
      );
      const subject = service as unknown as TestServerService;

      await service.configureRouters();
      await service.startServer();
      await service.startServer();

      const fakeServer = {
        upgrade: (_request: Request, options: unknown) => {
          upgradeCalls.push(options);
          return true;
        },
      };

      const handled = await subject.processFetchRequest(
        new Request('http://localhost/handled'),
        fakeServer,
      );
      const upgraded = await subject.processFetchRequest(
        new Request('http://localhost/upgrade'),
        fakeServer,
      );
      const skipped = await subject.processFetchRequest(
        new Request('http://localhost/skip'),
        fakeServer,
      );
      const failed = await subject.processFetchRequest(
        new Request('http://localhost/error'),
        fakeServer,
      );
      const missing = await subject.processFetchRequest(
        new Request('http://localhost/missing'),
        fakeServer,
      );

      if (!handled) {
        throw new Error('Expected handled response');
      }

      expect(handled.status).toBe(200);
      expect(upgraded?.status).toBe(501);
      expect(skipped).toBeUndefined();
      expect(failed?.status).toBe(500);
      expect(missing?.status).toBe(501);
      expect(upgradeCalls).toHaveLength(1);

      const openSocket = {
        data: {
          url: new URL('ws://localhost/socket'),
          data: {},
        },
      };
      await subject.processWebSocketEvent({ name: 'open' }, openSocket);

      const closeSocket = {
        data: {
          connectionId: Id.unique('Connection'),
          logger: requestLogger,
          url: new URL('ws://localhost/socket'),
          data: {},
        },
      };
      await subject.processWebSocketEvent(
        { name: 'close', code: 1000, reason: 'done' },
        closeSocket,
      );
      await subject.processWebSocketEvent({ name: 'drain' }, closeSocket);

      routerEvents.length = 0;

      const serverUrl = (
        service as unknown as {
          server: { url: URL };
        }
      ).server.url;
      const websocketUrl = new URL('/upgrade', serverUrl);
      websocketUrl.protocol = websocketUrl.protocol === 'https:' ? 'wss:' : 'ws:';

      const socket = await openRawWebSocket(websocketUrl);

      socket.write(createClientFrame(0x1, Buffer.from('hello')));
      socket.write(createClientFrame(0x9, Buffer.from([1])));
      socket.write(createClientFrame(0xa, Buffer.from([2])));

      await waitFor(() => {
        expect(routerEvents.some((event) => event.startsWith('message:'))).toBe(true);
        expect(routerEvents.some((event) => event.startsWith('ping:'))).toBe(true);
        expect(routerEvents.some((event) => event.startsWith('pong:'))).toBe(true);
        expect(routerEvents.some((event) => event.startsWith('drain:'))).toBe(true);
      });

      socket.write(createClientFrame(0x8, Buffer.alloc(0)));

      await waitFor(() => {
        expect(routerEvents.some((event) => event.startsWith('close:'))).toBe(true);
      });

      socket.end();

      await service.stopServer();
      await service.stopServer();

      expect(cleanupCalls.length).toBeGreaterThanOrEqual(4);
      expect(resolveCalls[0]).toEqual([routerProviderId, { moduleId: Id.for('module') }]);
      expect(
        (resolveCalls.slice(1) as [unknown, unknown][]).every(
          ([token, options]) =>
            token === Logger &&
            options &&
            typeof options === 'object' &&
            'requestId' in options,
        ),
      ).toBe(true);
      expect(routerEvents).not.toHaveLength(0);
      expect(logs.some((entry) => entry.startsWith('info:Started on http://'))).toBe(
        true,
      );
      expect(logs).toContain('info:Stopped');
      expect(logs).toContain('warn:Server already running');
      expect(logs.filter((entry) => entry === 'info:Stopped')).toHaveLength(2);
    });
  });
});
