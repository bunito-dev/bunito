import { describe, expect, it } from 'bun:test';
import { Test } from '@bunito/testing';
import { SERVER_FACTORY_ID } from '../constants';
import { ServerService } from '../server-service';
import type { ServerOptions } from '../types';
import type { TestServer } from './test-server';
import './definitions';

describe('server testing definitions', () => {
  it('provides the test server module factory', () => {
    const context = Test as unknown as {
      ServerModule: unknown;
      server: TestServer;
      serverFactory: (options: ServerOptions) => TestServer;
    };
    const server = context.server;
    const serverFactory = context.serverFactory;

    expect(context.ServerModule).toEqual({
      providers: [
        ServerService,
        {
          token: SERVER_FACTORY_ID,
          useValue: serverFactory,
        },
      ],
      exports: [ServerService],
    });
    expect(serverFactory({ port: 3000, fetch: () => new Response('ok') })).toBe(server);
  });

  it('provides a server factory backed by the shared test server', () => {
    const context = Test as unknown as {
      server: TestServer;
      serverFactory: (options: ServerOptions) => TestServer;
    };
    const server = context.serverFactory({
      port: 3000,
      fetch: () => new Response('ok'),
    });

    expect(server).toBe(context.server);
  });
});
