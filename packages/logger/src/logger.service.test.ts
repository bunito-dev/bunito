import { afterEach, describe, expect, it } from 'bun:test';
import type { LogFormatter } from './formatters';
import { LoggerService } from './logger.service';

const originalWrite = process.stdout.write.bind(process.stdout);

afterEach(() => {
  process.stdout.write = originalWrite;
});

describe('LoggerService', () => {
  it('writes formatted logs when level is enabled', () => {
    const writes: string[] = [];
    process.stdout.write = ((chunk: string) => {
      writes.push(chunk);
      return true;
    }) as typeof process.stdout.write;

    const formatter: LogFormatter = {
      logFormat: 'test',
      formatLog: (options) => JSON.stringify(options),
    };
    const loggerService = new LoggerService(
      {
        level: 'DEBUG',
        format: 'test',
      },
      [formatter],
    );

    loggerService.writeLog({
      level: 'ERROR',
      args: [new Error('Boom'), 'ignored message', { extra: true }],
      context: 'Context',
      traceId: 1,
    });

    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('"message":"Boom"');
    expect(writes[0]).toContain('"context":"Context"');
    expect(writes[0]).toContain('"data":["ignored message",{"extra":true}]');
  });

  it('skips disabled levels and empty formatter output', () => {
    const writes: string[] = [];
    process.stdout.write = ((chunk: string) => {
      writes.push(chunk);
      return true;
    }) as typeof process.stdout.write;

    const formatter: LogFormatter = {
      logFormat: 'test',
      formatLog: () => '',
    };
    const loggerService = new LoggerService(
      {
        level: 'ERROR',
        format: 'test',
      },
      [formatter],
    );

    loggerService.writeLog({
      level: 'DEBUG',
      args: ['debug'],
    });
    loggerService.writeLog({
      level: 'ERROR',
      args: ['error'],
    });

    expect(writes).toEqual([]);
  });

  it('rejects unsupported formats', () => {
    expect(() => {
      new LoggerService(
        {
          level: 'INFO',
          format: 'missing',
        },
        [],
      );
    }).toThrow('Logger format missing is not supported');
  });
});
