import { afterEach, describe, expect, it } from 'bun:test';
import { Bootstrap, Destroy, Module, Provider, Setup } from '../container';
import { Logger, LoggerModule } from '../logger';
import { App } from './app';

const originalLogLevel = process.env.LOG_LEVEL;
const originalLogFormat = process.env.LOG_FORMAT;

afterEach(() => {
  if (originalLogLevel === undefined) {
    delete process.env.LOG_LEVEL;
  } else {
    process.env.LOG_LEVEL = originalLogLevel;
  }

  if (originalLogFormat === undefined) {
    delete process.env.LOG_FORMAT;
  } else {
    process.env.LOG_FORMAT = originalLogFormat;
  }
});

@Provider()
class GreetingService {
  readonly message = 'hello';
}

@Module({
  imports: [LoggerModule],
  providers: [GreetingService],
})
class AppModule {
  setupRuns = 0;
  bootstrapRuns = 0;
  destroyRuns = 0;

  @Setup()
  onSetup(): void {
    this.setupRuns += 1;
  }

  @Bootstrap()
  onBootstrap(): void {
    this.bootstrapRuns += 1;
  }

  @Destroy()
  onDestroy(): void {
    this.destroyRuns += 1;
  }
}

@Module()
class BrokenModule {
  @Setup()
  onSetup(): void {
    throw new Error('setup failed');
  }
}

describe('App integration', () => {
  it('should create, resolve and run lifecycle with logger module imported', async () => {
    process.env.LOG_LEVEL = 'trace';
    process.env.LOG_FORMAT = 'none';

    const app = await App.create('Integration', AppModule);

    const moduleInstance = await app.resolve(AppModule);
    const greetingService = await app.resolve(GreetingService);
    const logger = await app.resolve(Logger);

    expect(app.logger).toBeDefined();
    expect(moduleInstance.setupRuns).toBe(1);
    expect(moduleInstance.bootstrapRuns).toBe(0);
    expect(moduleInstance.destroyRuns).toBe(0);
    expect(greetingService.message).toBe('hello');
    expect(logger).toBeInstanceOf(Logger);

    expect(await app.bootstrap()).toBeTrue();
    expect(moduleInstance.bootstrapRuns).toBe(1);

    expect(await app.teardown()).toBeTrue();
    expect(moduleInstance.destroyRuns).toBe(1);
  });

  it('should reject app creation when setup entrypoints fail', async () => {
    expect(App.create('Broken', BrokenModule)).rejects.toThrow('setup failed');
  });
});
