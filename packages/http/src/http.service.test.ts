import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import type { ClassProviderMetadata, LifecycleProps } from '@bunito/core';
import { CONTAINER_METADATA_KEYS } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpService } from './http.service';
import { RoutingService } from './routing';

function createLogger() {
  const warnings: unknown[][] = [];
  const infos: unknown[][] = [];

  return {
    warnings,
    infos,
    setContextCalls: [] as unknown[][],
    setContext(...args: unknown[]) {
      this.setContextCalls.push(args);
    },
    warn(...args: unknown[]) {
      warnings.push(args);
    },
    trace() {
      return {
        info(...args: unknown[]) {
          infos.push(args);
        },
      };
    },
  };
}

describe('HttpService', () => {
  it('should be registered with boot and destroy lifecycle handlers', () => {
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        HttpService,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      injects: [HttpConfig, expect.any(Function), RoutingService],
    });
    expect(
      getDecoratorMetadata<LifecycleProps>(
        HttpService,
        CONTAINER_METADATA_KEYS.ON_LIFECYCLE,
      ),
    ).toEqual(
      new Map([
        ['onBoot', 'startServer'],
        ['onDestroy', 'stopServer'],
      ]),
    );
  });

  it('should start and stop the bun server', async () => {
    const logger = createLogger();
    const processRequestCalls: Request[] = [];
    const stopCalls: unknown[] = [];
    const originalServe = Bun.serve;

    Bun.serve = ((options: {
      port: number;
      fetch: (request: Request) => Promise<Response>;
    }) => {
      void options.fetch(new Request('http://localhost/ping')).then(() => undefined);

      return {
        url: new URL(`http://localhost:${options.port}`),
        stop(force?: boolean) {
          stopCalls.push(force);
          return Promise.resolve();
        },
      } as Bun.Server<unknown>;
    }) as typeof Bun.serve;

    const service = new HttpService(
      {
        port: 3333,
      },
      logger as never,
      {
        async processRequest(request: Request) {
          processRequestCalls.push(request);
          return new Response('pong');
        },
      } as never,
    );

    try {
      service.startServer();
      service.startServer();
      await service.stopServer();
      await service.stopServer();
    } finally {
      Bun.serve = originalServe;
    }

    expect(logger.setContextCalls).toEqual([[HttpService]]);
    expect(logger.warnings).toEqual([['Server already running'], ['Server not running']]);
    expect(logger.infos).toEqual([
      ['Server started at http://localhost:3333/'],
      ['Server stopped'],
    ]);
    expect(stopCalls).toEqual([true]);
    expect(processRequestCalls).toHaveLength(1);
  });
});
