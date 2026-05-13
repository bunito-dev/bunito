import { describe, expect, it } from 'bun:test';
import { Logger } from './logger';
import type { LoggerService } from './logger-service';
import type { WriteLogOptions } from './types';

class Recorder implements Pick<LoggerService, 'writeLog'> {
  readonly logs: WriteLogOptions[] = [];

  writeLog(options: WriteLogOptions): void {
    this.logs.push(options);
  }
}

describe('Logger', () => {
  it('sets context from class and string values', () => {
    class ExampleContext {}

    const recorder = new Recorder();
    const logger = new Logger(recorder as unknown as LoggerService);

    logger.setContext(ExampleContext, 'worker');
    logger.info('message');
    logger.setContext('Manual');
    logger.ok('done');
    logger.setContext('');
    logger.warn('warn');

    expect(recorder.logs[0]?.context).toBe('ExampleContext.worker');
    expect(recorder.logs[1]?.context).toBe('Manual');
    expect(recorder.logs[2]?.context).toBeUndefined();
  });

  it('writes each direct log level and returns debug values', () => {
    const recorder = new Recorder();
    const logger = new Logger(recorder as unknown as LoggerService);
    const debugValue = logger.debug({ value: true });

    logger.fatal('fatal');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.ok('ok');
    logger.verbose('verbose');

    expect(debugValue).toEqual({ value: true });
    expect(recorder.logs.map((log) => log.kind)).toEqual([
      'DEBUG',
      'FATAL',
      'ERROR',
      'WARN',
      'INFO',
      'OK',
      'VERBOSE',
    ]);
  });

  it('writes trace logs with duration and returns debug values', () => {
    const recorder = new Recorder();
    const logger = new Logger(recorder as unknown as LoggerService);
    const trace = logger.track();

    trace.fatal('fatal');
    trace.error('error');
    trace.warn('warn');
    trace.info('info');
    trace.ok('ok');
    trace.verbose('verbose');
    const debugValue = trace.debug('debug-value');

    expect(debugValue).toBe('debug-value');
    expect(recorder.logs.map((log) => log.kind)).toEqual([
      'FATAL',
      'ERROR',
      'WARN',
      'INFO',
      'OK',
      'VERBOSE',
      'DEBUG',
    ]);
    expect(recorder.logs.every((log) => log.timestamp !== undefined)).toBeTrue();
  });

  it('clones logger settings and stops tracking on the current logger', () => {
    const recorder = new Recorder();
    const logger = new Logger(recorder as unknown as LoggerService);

    logger.setContext('Root').startTracking();

    const clonedWithInheritedContext = logger.clone();
    const clonedWithOwnContext = logger.clone('Child');

    logger.stopTracking();
    logger.info('root');
    clonedWithInheritedContext.info('inherited');
    clonedWithOwnContext.info('child');

    expect(recorder.logs[0]?.context).toBe('Root');
    expect(recorder.logs[0]?.timestamp).toBeUndefined();
    expect(recorder.logs[1]?.context).toBe('Root');
    expect(recorder.logs[1]?.timestamp).toBeInstanceOf(Date);
    expect(recorder.logs[2]?.context).toBe('Child');
    expect(recorder.logs[2]?.timestamp).toBeInstanceOf(Date);
  });
});
