import { describe, expect, it } from 'bun:test';
import { Logger } from '@bunito/logger';
import { mockClass } from '@bunito/testing';
import { App } from './app';

describe('App', () => {
  class TestApp extends App {
    protected static override readonly defaultModules = [];
  }

  it('creates, starts and resolves through the underlying container', async () => {
    class Service {
      readonly value = 123;
    }

    const logger = mockClass(Logger);
    logger.track.mockReturnValue(logger as unknown as Logger);

    const app = await TestApp.create({
      providers: [
        {
          token: Service,
          useValue: new Service(),
        },
        {
          token: Logger,
          useValue: logger as unknown as Logger,
        },
      ],
      exports: [Service, Logger],
    });

    expect(await app.resolve(Service)).toEqual({ value: 123 });

    await app.start();
    await app.shutdown();
  });

  it('creates and starts apps while forwarding logger context', async () => {
    const logger = mockClass(Logger);
    logger.track.mockReturnValue(logger as unknown as Logger);

    const created = await TestApp.create({
      providers: [
        {
          token: Logger,
          useValue: logger as unknown as Logger,
        },
      ],
      exports: [Logger],
    });
    const started = await TestApp.start({
      providers: [
        {
          token: Logger,
          useValue: logger as unknown as Logger,
        },
      ],
      exports: [Logger],
    });

    expect(created.logger).toBeDefined();
    expect(started.logger).toBeDefined();
    expect(logger.ok).toHaveBeenCalledWith('Ready');
  });

  it('logs startup failures when a logger is available and throws without one', async () => {
    class TestApp extends App {
      static createForTest(container: object, logger?: object): TestApp {
        return new TestApp(container as never, logger as never);
      }
    }

    const logger = mockClass(Logger);
    logger.track.mockReturnValue(logger as unknown as Logger);

    const appWithLogger = TestApp.createForTest(
      {
        triggerProviders: async () => {
          throw new Error('fail');
        },
        destroyProviders: async () => undefined,
        resolveProvider: async () => undefined,
      } as never,
      logger as unknown as Logger,
    );

    await appWithLogger.start();
    expect(logger.fatal).toHaveBeenCalledWith('Unhandled Error', expect.any(Error));
    await appWithLogger.start();
    expect(logger.fatal).toHaveBeenCalledTimes(2);

    expect(logger.fatal.mock.calls[1]?.[1]).toBeInstanceOf(Error);
    expect((logger.fatal.mock.calls[1]?.[1] as Error).message).toBe(
      'App start can only be called once',
    );
  });
});
