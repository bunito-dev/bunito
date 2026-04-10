import { afterEach, describe, expect, it } from 'bun:test';
import { Module, OnBoot, OnDestroy, OnInit, Provider } from '../container';
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
  initRuns = 0;
  bootRuns = 0;
  destroyRuns = 0;

  @OnInit()
  onInit(): void {
    this.initRuns += 1;
  }

  @OnBoot()
  onBoot(): void {
    this.bootRuns += 1;
  }

  @OnDestroy()
  onDestroy(): void {
    this.destroyRuns += 1;
  }
}

@Module()
class BrokenModule {
  @OnInit()
  onInit(): void {
    throw new Error('setup failed');
  }

  @OnBoot()
  onBoot(): void {}
}

describe('App integration', () => {
  it('should create, resolve and run lifecycle with logger module imported', async () => {
    process.env.LOG_LEVEL = 'VERBOSE';
    process.env.LOG_FORMAT = 'prettify';

    const app = await App.create(AppModule, 'Integration');

    const moduleInstance = await app.resolve(AppModule);
    const greetingService = await app.resolve(GreetingService);
    const logger = await app.resolve(Logger);

    expect(app.logger).toBeInstanceOf(Logger);
    expect(moduleInstance.initRuns).toBe(1);
    expect(moduleInstance.bootRuns).toBe(0);
    expect(moduleInstance.destroyRuns).toBe(0);
    expect(greetingService.message).toBe('hello');
    expect(logger).toBeInstanceOf(Logger);

    expect(await app.boot()).toBeTrue();
    expect(moduleInstance.bootRuns).toBe(1);

    expect(await app.destroy()).toBeTrue();
    expect(moduleInstance.destroyRuns).toBe(1);
  });

  it('should reject app creation when setup fails while resolving a bootable provider', async () => {
    await expect(App.create(BrokenModule, 'Broken')).rejects.toThrow('setup failed');
  });
});
