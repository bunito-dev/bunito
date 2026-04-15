import { describe, expect, it } from 'bun:test';
import { Logger } from '../logger';
import { App } from './app';

describe('App', () => {
  it('creates, starts and resolves through the underlying container', async () => {
    class Service {
      readonly value = 123;
    }

    const app = await App.create({
      providers: [
        {
          token: Service,
          useValue: new Service(),
        },
      ],
    });

    expect(await app.resolve(Service)).toEqual({ value: 123 });

    await app.start();
    await app.shutdown();
  });

  it('supports named create/start and forwards logger context', async () => {
    const contexts: [unknown, string | undefined][] = [];
    const traceLogs: string[] = [];

    const logger = {
      setContext: (target: unknown, name?: string) => {
        contexts.push([target, name]);
      },
      trace: () => ({
        fatal: () => undefined,
        error: () => undefined,
        warn: () => undefined,
        info: () => undefined,
        ok: (message: string) => {
          traceLogs.push(message);
        },
        verbose: () => undefined,
        debug: (message: string) => {
          traceLogs.push(message);
          return message;
        },
      }),
      fatal: () => undefined,
    };

    const created = await App.create('NamedApp', {
      providers: [
        {
          token: Logger,
          useValue: logger,
        },
      ],
    });
    const started = await App.start('StartedApp', {
      providers: [
        {
          token: Logger,
          useValue: logger,
        },
      ],
    });

    expect(created.logger).toBeDefined();
    expect(started.logger).toBeDefined();
    expect(contexts).toEqual([
      [App, 'NamedApp'],
      [App, 'StartedApp'],
    ]);
    expect(traceLogs).toContain('Ready');
  });

  it('logs startup failures when a logger is available and throws without one', async () => {
    const failures: string[] = [];

    class TestApp extends App {
      static createForTest(container: object, logger?: object): TestApp {
        return new TestApp(container as never, logger as never);
      }
    }

    const appWithLogger = TestApp.createForTest(
      {
        boot: async () => {
          throw new Error('fail');
        },
        destroy: async () => undefined,
        resolveProvider: async () => undefined,
      } as never,
      {
        trace: () => ({
          fatal: (message: string) => {
            failures.push(message);
          },
          error: () => undefined,
          warn: () => undefined,
          info: () => undefined,
          ok: () => undefined,
          verbose: () => undefined,
          debug: <T>(value: T) => value,
        }),
      } as never,
    );

    await appWithLogger.start();
    expect(failures).toEqual(['Unhandled Error']);

    const appWithoutLogger = TestApp.createForTest(
      {
        boot: async () => undefined,
        destroy: async () => undefined,
        resolveProvider: async () => undefined,
      } as never,
      undefined,
    );

    await appWithoutLogger.start();
    await expect(appWithoutLogger.start()).rejects.toThrow(
      'App start cannot be called twice',
    );
  });
});
