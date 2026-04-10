import { afterEach, describe, expect, it } from 'bun:test';
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

type TraceLogger = {
  fatalCalls: unknown[][];
  okCalls: unknown[][];
  fatal: (...args: unknown[]) => void;
  ok: (...args: unknown[]) => void;
};

type FakeLogger = {
  contexts: [unknown, string | undefined][];
  traces: TraceLogger[];
  setContext: (context: unknown, description?: string) => void;
  trace: () => TraceLogger;
};

type FakeContainer = {
  setInstances: [unknown, unknown][];
  resolved: unknown[];
  tried: unknown[];
  setInstance: (token: unknown, instance: unknown) => void;
  resolveProvider: (token: unknown) => Promise<unknown>;
  tryResolveProvider: (token: unknown) => Promise<unknown>;
  setup: () => Promise<void>;
  boot: () => Promise<void>;
  destroy: () => Promise<void>;
};

function createLogger(): FakeLogger {
  return {
    contexts: [],
    traces: [],
    setContext(context, description) {
      this.contexts.push([context, description]);
    },
    trace() {
      const trace: TraceLogger = {
        fatalCalls: [],
        okCalls: [],
        fatal(...args) {
          this.fatalCalls.push(args);
        },
        ok(...args) {
          this.okCalls.push(args);
        },
      };

      this.traces.push(trace);

      return trace;
    },
  };
}

function createContainer(): FakeContainer {
  return {
    setInstances: [],
    resolved: [],
    tried: [],
    setInstance(token, instance) {
      this.setInstances.push([token, instance]);
    },
    async resolveProvider(token) {
      this.resolved.push(token);
      return `resolve:${String(token)}`;
    },
    async tryResolveProvider(token) {
      this.tried.push(token);
      return `try:${String(token)}`;
    },
    async setup() {},
    async boot() {},
    async destroy() {},
  };
}

describe('App', () => {
  it('should register itself in the container and set logger context in the constructor', () => {
    const logger = createLogger();
    const container = createContainer();
    const app = new App('Unit', logger as never, container as never);

    expect(container.setInstances).toEqual([[App, app]]);
    expect(logger.contexts).toEqual([[App, 'Unit']]);
  });

  it('should delegate resolve methods to the container', async () => {
    const app = new App(undefined, undefined, createContainer() as never);

    expect(await app.resolve<string>('token')).toBe('resolve:token');
    expect(await app.tryResolve<string>('token')).toBe('try:token');
  });

  it('should return true and log success when boot and destroy complete', async () => {
    const logger = createLogger();
    const container = createContainer();
    const app = new App('Unit', logger as never, container as never);

    expect(await app.boot()).toBeTrue();
    expect(await app.destroy()).toBeTrue();
    expect(logger.traces).toHaveLength(2);
    expect(logger.traces[0]?.okCalls).toEqual([['Started']]);
    expect(logger.traces[1]?.okCalls).toEqual([['Destroyed']]);
  });

  it('should return false and log fatal errors when actions fail and tracing is available', async () => {
    const logger = createLogger();
    const container = createContainer();
    const error = new Error('boom');

    container.boot = async () => {
      throw error;
    };

    const app = new App('Unit', logger as never, container as never);

    expect(await app.boot()).toBeFalse();
    expect(logger.traces).toHaveLength(1);
    expect(logger.traces[0]?.fatalCalls).toEqual([[error]]);
  });

  it('should rethrow action errors when no logger is available', async () => {
    const container = createContainer();

    container.boot = async () => {
      throw new Error('boom');
    };

    const app = new App(undefined, undefined, container as never);

    await expect(app.boot()).rejects.toThrow('boom');
  });

  it('should create an app without logger support when Logger is unavailable', async () => {
    const app = await App.create({});

    expect(app.logger).toBeUndefined();
    expect(await app.resolve(App)).toBe(app);
    expect(await app.tryResolve('missing')).toBeUndefined();
  });

  it('should create an app with logger support when LoggerModule is imported', async () => {
    process.env.LOG_LEVEL = 'VERBOSE';
    process.env.LOG_FORMAT = 'prettify';

    const app = await App.create(
      {
        imports: [LoggerModule],
      },
      'Logged',
    );

    expect(app.logger).toBeInstanceOf(Logger);
    expect(await app.resolve(App)).toBe(app);
    await expect(app.resolve('missing')).rejects.toThrow('Could not resolve');
  });
});
