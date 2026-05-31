import { describe, expect, it, mock } from 'bun:test';
import { InternalException } from '@bunito/common';
import { Module, Provider } from '@bunito/container';
import type { Logger } from '@bunito/logger';
import { App } from './app';
import { OnAppShutdown, OnAppStart } from './decorators';

@Provider()
class AppTestService {
  started = false;

  shutdown = false;

  @OnAppStart()
  onStart(): void {
    this.started = true;
  }

  @OnAppShutdown()
  onShutdown(): void {
    this.shutdown = true;
  }
}

@Module({
  providers: [AppTestService],
  exports: [AppTestService],
})
class AppTestModule {}

function createLogger() {
  const tracked = {
    ok: mock(() => undefined),
    fatal: mock(() => undefined),
  };

  return {
    logger: {
      track: mock(() => tracked),
      fatal: mock(() => undefined),
    } as unknown as Logger,
    tracked,
  };
}

describe('App', () => {
  it('creates, starts, resolves, and shuts down applications', async () => {
    const app = await App.create(AppTestModule, { silent: true });

    await app.start();

    const service = await app.resolve(AppTestService);
    expect(service.started).toBeTrue();

    await app.shutdown();

    expect(service.shutdown).toBeTrue();
  });

  it('logs lifecycle events when not silent and guards repeated actions', async () => {
    const container = {
      triggerProviders: mock(async () => undefined),
      destroyInstances: mock(async () => undefined),
      resolveProvider: mock(async () => 'value'),
    };
    const { logger, tracked } = createLogger();
    const app = new App({ silent: false }, container as never, logger);
    const actions: string[] = [];

    app.on('action', (action) => actions.push(action));

    await app.start();
    await app.shutdown();
    await app.start();

    expect(actions).toEqual(['start', 'shutdown']);
    expect(tracked.ok).toHaveBeenNthCalledWith(1, 'Ready');
    expect(tracked.ok).toHaveBeenNthCalledWith(2, 'Shutdown');
    expect(logger.fatal).toHaveBeenCalledWith(
      'Unhandled error',
      new InternalException('App start can only be called once'),
    );
  });

  it('forwards resolve failures to the logger or rethrows without one', async () => {
    const err = new Error('missing');
    const container = {
      resolveProvider: mock(() => {
        throw err;
      }),
    };
    const { logger } = createLogger();

    await new App({ silent: true }, container as never, logger).resolve(AppTestService);
    expect(logger.fatal).toHaveBeenCalledWith(err);

    let caught: unknown;
    try {
      await new App({ silent: true }, container as never, undefined).resolve(
        AppTestService,
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(err);
  });

  it('emits errors without a logger and logs action errors with one', async () => {
    const err = new Error('boom');
    const failingContainer = {
      triggerProviders: mock(async () => {
        throw err;
      }),
    };
    const emitted: unknown[] = [];
    const appWithoutLogger = new App(
      { silent: true },
      failingContainer as never,
      undefined,
    );

    appWithoutLogger.on('error', (error) => emitted.push(error));
    await appWithoutLogger.start();

    expect(emitted).toEqual([err]);

    const { logger, tracked } = createLogger();
    const appWithLogger = new App({ silent: true }, failingContainer as never, logger);

    await appWithLogger.start();

    expect(tracked.fatal).toHaveBeenCalledWith('Unhandled error', err);
  });

  it('starts apps through the static convenience method', async () => {
    const app = await App.start(AppTestModule, { silent: true });

    expect(await app.resolve(AppTestService)).toBeInstanceOf(AppTestService);

    await app.shutdown();
  });
});
