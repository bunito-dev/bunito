import { describe, expect, it, mock } from 'bun:test';
import { Logger } from './logger';
import type { LoggerService } from './logger.service';

describe('Logger', () => {
  it('writes all log levels and returns debug values', () => {
    const service = {
      processLog: mock(),
    } as unknown as LoggerService;
    const logger = new Logger({}, service);
    const value = { ok: true };

    logger.fatal('fatal');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.ok('ok');
    logger.verbose('verbose');
    const debug = logger.debug(value);

    expect(debug).toBe(value);
    expect(service.processLog).toHaveBeenCalledTimes(7);
    expect(service.processLog).toHaveBeenNthCalledWith(1, {
      kind: 'FATAL',
      args: ['fatal'],
    });
    expect(service.processLog).toHaveBeenNthCalledWith(7, {
      kind: 'DEBUG',
      args: [value],
    });
  });

  it('tracks nested logger context and duration', () => {
    const service = {
      processLog: mock(),
    } as unknown as LoggerService;
    const logger = new Logger(
      {
        context: 'Root',
      },
      service,
    );

    logger.track('Child').info('message');

    expect(service.processLog).toHaveBeenCalledWith({
      kind: 'INFO',
      args: ['message'],
      context: 'Root.Child',
      timestamp: expect.any(Date),
    });
  });
});
