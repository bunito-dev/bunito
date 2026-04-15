import { describe, expect, it } from 'bun:test';
import { Logger } from './logger';

describe('Logger', () => {
  describe('setContext', () => {
    it('stores a resolved context for class and string values', () => {
      const writes: unknown[] = [];
      const logger = new Logger(
        {
          writeLog: (options: unknown) => {
            writes.push(options);
          },
        } as never,
        { index: 7 } as never,
      );

      logger.setContext(Logger, 'Request');
      logger.info('message');
      logger.setContext('', 'ignored');
      logger.info('message-2');

      expect(writes).toEqual([
        expect.objectContaining({
          context: 'Logger(Request)',
          traceId: 7,
          level: 'INFO',
          args: ['message'],
        }),
        expect.objectContaining({
          context: 'Logger(Request)',
          level: 'INFO',
          args: ['message-2'],
        }),
      ]);
    });
  });

  describe('debug', () => {
    it('writes a debug log and returns the first argument', () => {
      const writes: unknown[] = [];
      const logger = new Logger(
        {
          writeLog: (options: unknown) => {
            writes.push(options);
          },
        } as never,
        { index: 7 } as never,
      );

      expect(logger.debug('debug-message')).toBe('debug-message');
      expect(writes).toEqual([
        expect.objectContaining({
          level: 'DEBUG',
          args: ['debug-message'],
        }),
      ]);
    });
  });

  describe('trace', () => {
    it('writes all trace levels with duration and returns the first debug argument', () => {
      const writes: unknown[] = [];
      const logger = new Logger(
        {
          writeLog: (options: unknown) => {
            writes.push(options);
          },
        } as never,
        { index: 7 } as never,
      );

      const trace = logger.trace();

      expect(trace.debug('trace-message')).toBe('trace-message');
      trace.fatal('trace-fatal');
      trace.error('trace-error');
      trace.warn('trace-warn');
      trace.info('trace-info');
      trace.ok('trace-ok');
      trace.verbose('trace-verbose');

      expect(writes).toEqual([
        expect.objectContaining({
          level: 'DEBUG',
          args: ['trace-message'],
          duration: expect.any(Number),
        }),
        expect.objectContaining({
          level: 'FATAL',
          args: ['trace-fatal'],
        }),
        expect.objectContaining({
          level: 'ERROR',
          args: ['trace-error'],
        }),
        expect.objectContaining({
          level: 'WARN',
          args: ['trace-warn'],
        }),
        expect.objectContaining({
          level: 'INFO',
          args: ['trace-info'],
        }),
        expect.objectContaining({
          level: 'OK',
          args: ['trace-ok'],
        }),
        expect.objectContaining({
          level: 'VERBOSE',
          args: ['trace-verbose'],
        }),
      ]);
    });
  });

  describe('log methods', () => {
    it('writes each direct log level', () => {
      const writes: unknown[] = [];
      const logger = new Logger(
        {
          writeLog: (options: unknown) => {
            writes.push(options);
          },
        } as never,
        { index: 7 } as never,
      );

      logger.fatal('fatal');
      logger.error('error');
      logger.warn('warn');
      logger.ok('ok');
      logger.verbose('verbose');

      expect(writes).toEqual([
        expect.objectContaining({
          level: 'FATAL',
          args: ['fatal'],
        }),
        expect.objectContaining({
          level: 'ERROR',
          args: ['error'],
        }),
        expect.objectContaining({
          level: 'WARN',
          args: ['warn'],
        }),
        expect.objectContaining({
          level: 'OK',
          args: ['ok'],
        }),
        expect.objectContaining({
          level: 'VERBOSE',
          args: ['verbose'],
        }),
      ]);
    });
  });
});
