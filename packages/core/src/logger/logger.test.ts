import { afterEach, describe, expect, it } from 'bun:test';
import { PROVIDER_METADATA_KEY } from '../container/constants';
import { LOG_FORMATTERS } from './constants';
import { Logger } from './logger';

type FakeStdout = {
  output: string;
  write: (chunk: string) => boolean;
};

function createStdout(): FakeStdout {
  return {
    output: '',
    write(chunk: string) {
      this.output += chunk;
      return true;
    },
  };
}

const originalJsonFormatter = LOG_FORMATTERS.json;
const originalPrettifyFormatter = LOG_FORMATTERS.prettify;
const originalNoneFormatter = LOG_FORMATTERS.none;

afterEach(() => {
  LOG_FORMATTERS.json = originalJsonFormatter;
  LOG_FORMATTERS.prettify = originalPrettifyFormatter;
  LOG_FORMATTERS.none = originalNoneFormatter;
});

describe('Logger', () => {
  it('should be registered as a transient provider injecting LoggerConfig', () => {
    expect(Logger[Symbol.metadata]?.[PROVIDER_METADATA_KEY]).toEqual({
      scope: 'transient',
      injects: [expect.any(Object)],
      useClass: Logger,
    });
  });

  it('should set context from strings and classes', () => {
    const logger = new Logger({
      level: 'verbose',
      format: 'none',
    });

    logger.setContext('App');
    expect((logger as unknown as { context?: string }).context).toBe('App');

    class AppService {}

    logger.setContext(AppService);
    expect((logger as unknown as { context?: string }).context).toBe('AppService');
  });

  it('should skip messages below the configured log level', () => {
    const calls: Array<unknown> = [];

    LOG_FORMATTERS.json = (...args) => {
      calls.push(args);
    };

    const logger = new Logger({
      level: 'warn',
      format: 'json',
    });

    logger.info('ignored');
    logger.error('logged');

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([process.stdout, undefined, 'error', 'logged', []]);
  });

  it('should skip logging when the configured formatter is missing', () => {
    const logger = new Logger({
      level: 'verbose',
      format: 'none',
    });
    const stdout = createStdout();

    (logger as unknown as { stdout: NodeJS.WriteStream }).stdout =
      stdout as unknown as NodeJS.WriteStream;

    logger.info('hello');

    expect(stdout.output).toBe('');
  });

  it('should pass context, message and args to the configured formatter', () => {
    const calls: Array<unknown> = [];

    LOG_FORMATTERS.prettify = (...args) => {
      calls.push(args);
    };

    const logger = new Logger({
      level: 'verbose',
      format: 'prettify',
    });

    logger.setContext('App');
    expect(logger.warn('hello', 123)).toBe('hello');
    expect(logger.debug({ foo: 'bar' }, 'extra')).toEqual({ foo: 'bar' });

    expect(calls).toEqual([
      [process.stdout, 'App', 'warn', 'hello', [123]],
      [process.stdout, 'App', 'debug', { foo: 'bar' }, ['extra']],
    ]);
  });

  it('should route fatal, error and verbose messages through the logger pipeline', () => {
    const calls: Array<unknown> = [];

    LOG_FORMATTERS.json = (...args) => {
      calls.push(args);
    };

    const logger = new Logger({
      level: 'verbose',
      format: 'json',
    });

    logger.fatal('fatal-message', 1);
    logger.error('error-message', 2);
    expect(logger.verbose('verbose-message', 3)).toBe('verbose-message');

    expect(calls).toEqual([
      [process.stdout, undefined, 'fatal', 'fatal-message', [1]],
      [process.stdout, undefined, 'error', 'error-message', [2]],
      [process.stdout, undefined, 'verbose', 'verbose-message', [3]],
    ]);
  });
});
