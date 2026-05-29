import { describe, expect, it, mock } from 'bun:test';
import { InternalException } from '@bunito/common';
import type { LogTransport } from './log-transport';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  it('writes formatted logs when the level is enabled', () => {
    const transport: LogTransport = {
      NAME: 'pretty',
      write: mock(),
    };
    const error = new Error('Boom');
    const timestamp = new Date(Date.now() - 25);
    const service = new LoggerService(
      {
        level: 'DEBUG',
        transport: 'pretty',
        exitOnFatal: false,
      },
      () => 123,
      [transport],
    );

    service.processLog({
      kind: 'ERROR',
      args: ['Failed', { context: 'Job' }, error, { id: 1 }],
      timestamp,
      context: 'Worker',
    });

    expect(transport.write).toHaveBeenCalledWith({
      level: {
        kind: 'ERROR',
        value: 50,
      },
      timestamp: expect.any(Date),
      context: 'Worker.Job',
      requestId: 123,
      message: 'Failed',
      error,
      data: [{ id: 1 }],
      duration: expect.any(Number),
    });
  });

  it('skips disabled levels and keeps fatal logs in-process when configured', () => {
    const transport: LogTransport = {
      NAME: 'pretty',
      write: mock(),
    };
    const service = new LoggerService(
      {
        level: 'ERROR',
        transport: 'pretty',
        exitOnFatal: false,
      },
      () => undefined,
      [transport],
    );

    service.processLog({
      kind: 'DEBUG',
      args: ['Debug'],
    });
    service.processLog({
      kind: 'FATAL',
      args: ['Fatal'],
    });

    expect(transport.write).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported transports', () => {
    expect(
      () =>
        new LoggerService(
          {
            level: 'DEBUG',
            transport: 'missing',
            exitOnFatal: false,
          },
          () => undefined,
          [],
        ),
    ).toThrow(new InternalException('Logger transport "missing" is not supported'));
  });
});
