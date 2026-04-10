import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import type { ClassProviderMetadata } from '../container';
import { CONTAINER_METADATA_KEYS, Id, REQUEST_ID } from '../container';
import { Logger } from './logger';
import { LoggerService } from './logger.service';
import type { WriteLogOptions } from './types';

describe('Logger', () => {
  it('should be registered as a request-scoped provider', () => {
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        Logger,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'request',
      injects: [
        LoggerService,
        {
          optional: true,
          token: REQUEST_ID,
        },
      ],
    });
  });

  it('should set context from strings and callables', () => {
    const calls: unknown[] = [];
    const logger = new Logger(
      {
        writeLog(options: WriteLogOptions) {
          calls.push(options);
        },
      } as unknown as LoggerService,
      new Id('request', 7),
    );

    class AppService {}

    logger.setContext('App');
    logger.info('plain');
    logger.setContext(AppService, 'HTTP');
    logger.ok('scoped');
    logger.setContext('');
    logger.verbose('ignored-context');

    expect(calls).toEqual([
      {
        context: 'App',
        traceId: 7,
        level: 'INFO',
        args: ['plain'],
      },
      {
        context: 'AppService(HTTP)',
        traceId: 7,
        level: 'OK',
        args: ['scoped'],
      },
      {
        context: 'AppService(HTTP)',
        traceId: 7,
        level: 'VERBOSE',
        args: ['ignored-context'],
      },
    ]);
  });

  it('should route log methods through LoggerService and return the first debug argument', () => {
    const calls: unknown[] = [];
    const logger = new Logger({
      writeLog(options: WriteLogOptions) {
        calls.push(options);
      },
    } as unknown as LoggerService);

    expect(logger.debug({ foo: 'bar' }, 'extra')).toEqual({ foo: 'bar' });
    logger.warn('warn');
    logger.info('info');
    logger.ok('ok');
    logger.verbose('verbose');
    logger.fatal('fatal');
    logger.error('error');

    expect(calls).toEqual([
      {
        context: undefined,
        traceId: undefined,
        level: 'DEBUG',
        args: [{ foo: 'bar' }, 'extra'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'WARN',
        args: ['warn'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'INFO',
        args: ['info'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'OK',
        args: ['ok'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'VERBOSE',
        args: ['verbose'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'FATAL',
        args: ['fatal'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'ERROR',
        args: ['error'],
      },
    ]);
  });

  it('should include duration in traced child loggers', () => {
    const calls: unknown[] = [];
    const logger = new Logger({
      writeLog(options: WriteLogOptions) {
        calls.push(options);
      },
    } as unknown as LoggerService);
    const originalNow = Date.now;

    let now = 100;
    Date.now = () => now;

    try {
      const trace = logger.trace();

      now = 125;
      trace.fatal('fatal');
      now = 150;
      trace.error('error');
      now = 175;
      trace.warn('warn');
      now = 250;
      trace.info('info');
      now = 300;
      trace.ok('ok');
      now = 350;
      trace.verbose('verbose');
      now = 450;
      expect(trace.debug('debug-value')).toBe('debug-value');
    } finally {
      Date.now = originalNow;
    }

    expect(calls).toEqual([
      {
        context: undefined,
        traceId: undefined,
        level: 'FATAL',
        args: ['fatal'],
        duration: 25,
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'ERROR',
        args: ['error'],
        duration: 50,
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'WARN',
        args: ['warn'],
        duration: 75,
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'INFO',
        args: ['info'],
        duration: 150,
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'OK',
        args: ['ok'],
        duration: 200,
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'VERBOSE',
        args: ['verbose'],
        duration: 250,
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'DEBUG',
        args: ['debug-value'],
        duration: 350,
      },
    ]);
  });

  it('should map fatal and error to the matching log levels', () => {
    const calls: unknown[] = [];
    const logger = new Logger({
      writeLog(options: WriteLogOptions) {
        calls.push(options);
      },
    } as unknown as LoggerService);
    const originalNow = Date.now;

    let now = 10;
    Date.now = () => now;

    try {
      logger.fatal('fatal');
      logger.error('error');

      const trace = logger.trace();

      now = 20;
      trace.fatal('trace-fatal');
      now = 30;
      trace.error('trace-error');
    } finally {
      Date.now = originalNow;
    }

    expect(calls).toEqual([
      {
        context: undefined,
        traceId: undefined,
        level: 'FATAL',
        args: ['fatal'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'ERROR',
        args: ['error'],
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'FATAL',
        args: ['trace-fatal'],
        duration: 10,
      },
      {
        context: undefined,
        traceId: undefined,
        level: 'ERROR',
        args: ['trace-error'],
        duration: 20,
      },
    ]);
  });
});
