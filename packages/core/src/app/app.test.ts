import { afterEach, describe, expect, it } from 'bun:test';
import { LoggerModule } from '../logger';
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

type FakeLogger = {
  traceCalls: Array<unknown>;
  okCalls: Array<unknown>;
  infoCalls: Array<unknown>;
  errorCalls: Array<unknown>;
  contexts: Array<string>;
  trace: (...args: Array<unknown>) => void;
  ok: (...args: Array<unknown>) => void;
  info: (...args: Array<unknown>) => void;
  error: (...args: Array<unknown>) => void;
  setContext: (context: string) => void;
};

function createLogger(): FakeLogger {
  return {
    traceCalls: [],
    okCalls: [],
    infoCalls: [],
    errorCalls: [],
    contexts: [],
    trace(...args) {
      this.traceCalls.push(args);
    },
    ok(...args) {
      this.okCalls.push(args);
    },
    info(...args) {
      this.infoCalls.push(args);
    },
    error(...args) {
      this.errorCalls.push(args);
    },
    setContext(context) {
      this.contexts.push(context);
    },
  };
}

class TestApp extends App {
  constructor(
    logger: FakeLogger | undefined,
    container: {
      setInstance: (token: unknown, instance: unknown) => void;
      resolve: (token: unknown) => Promise<unknown>;
      tryResolve: (token: unknown) => Promise<unknown>;
      boot: () => Promise<void>;
      destroy: () => Promise<void>;
    },
  ) {
    super('Test', logger as never, container as never);
  }

  runWrapPromise(
    promiseFn: () => Promise<void>,
    traceMessage: string,
    successMessage: string,
  ): Promise<boolean> {
    return this.wrapPromise(promiseFn, traceMessage, successMessage);
  }
}

describe('App', () => {
  it('should create an app without logger support when Logger is not available', async () => {
    const app = await App.create('Plain', {});

    expect(app.logger).toBeUndefined();
    expect(await app.resolve(App)).toBe(app);
    expect(await app.tryResolve('missing')).toBeUndefined();
  });

  it('should create an app with a logger when LoggerModule is imported', async () => {
    process.env.LOG_LEVEL = 'trace';
    process.env.LOG_FORMAT = 'none';

    const app = await App.create('Logged', {
      imports: [LoggerModule],
    });

    expect(app.logger).toBeDefined();
    expect(await app.resolve(App)).toBe(app);
    expect(app.resolve('missing')).rejects.toThrow('Could not resolve');
  });

  it('should wrap successful operations with trace and success logs', async () => {
    const logger = createLogger();
    const instances = new Map<unknown, unknown>();
    const app = new TestApp(logger, {
      setInstance(token, instance) {
        instances.set(token, instance);
      },
      resolve: async () => 'resolved',
      tryResolve: async () => undefined,
      boot: async () => undefined,
      destroy: async () => undefined,
    });

    expect(instances.get(App)).toBe(app);
    expect(await app.boot()).toBeTrue();
    expect(await app.destroy()).toBeTrue();
    expect(logger.contexts).toEqual(['App(Test)']);
    expect(logger.traceCalls).toEqual([['Booting...'], ['Destroying...']]);
    expect(logger.okCalls).toEqual([['Ready!'], ['Destroyed!']]);
    expect(logger.infoCalls).toEqual([]);
    expect(logger.errorCalls).toEqual([]);
  });

  it('should return false and log the error when an operation fails with logger enabled', async () => {
    const logger = createLogger();
    const error = new Error('boom');
    const app = new TestApp(logger, {
      setInstance: () => undefined,
      resolve: async () => undefined,
      tryResolve: async () => undefined,
      boot: async () => {
        throw error;
      },
      destroy: async () => undefined,
    });

    expect(await app.boot()).toBeFalse();
    expect(logger.traceCalls).toEqual([['Booting...']]);
    expect(logger.okCalls).toEqual([]);
    expect(logger.errorCalls).toEqual([[error]]);
  });

  it('should delegate resolve methods to the container', async () => {
    const logger = createLogger();
    const app = new TestApp(logger, {
      setInstance: () => undefined,
      resolve: async (token) => `resolve:${String(token)}`,
      tryResolve: async (token) => `try:${String(token)}`,
      boot: async () => undefined,
      destroy: async () => undefined,
    });

    expect(await app.resolve<string>('token')).toBe('resolve:token');
    expect(await app.tryResolve<string>('token')).toBe('try:token');
  });

  it('should return false instead of rejecting when logger is unavailable and an operation fails', async () => {
    const app = new TestApp(undefined, {
      setInstance: () => undefined,
      resolve: async () => undefined,
      tryResolve: async () => undefined,
      boot: async () => {
        throw new Error('boom');
      },
      destroy: async () => undefined,
    });

    expect(await app.boot()).toBeFalse();
  });

  it('should expose wrapPromise to subclasses', async () => {
    const logger = createLogger();
    const app = new TestApp(logger, {
      setInstance: () => undefined,
      resolve: async () => undefined,
      tryResolve: async () => undefined,
      boot: async () => undefined,
      destroy: async () => undefined,
    });

    expect(
      await app.runWrapPromise(() => Promise.resolve(), 'Tracing...', 'Done!'),
    ).toBeTrue();
    expect(logger.traceCalls.at(-1)).toEqual(['Tracing...']);
    expect(logger.okCalls.at(-1)).toEqual(['Done!']);
  });
});
