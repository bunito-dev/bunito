import { describe, expect, it, spyOn } from 'bun:test';
import type { LogRecord } from '@bunito/logger';
import { CLIException } from './cli.exception';
import { CLILogTransport } from './cli.log-transport';

function record(options: Partial<LogRecord>): LogRecord {
  return {
    timestamp: new Date(),
    level: {
      kind: 'INFO',
      value: 30,
    },
    ...options,
  };
}

describe('CLILogTransport', () => {
  it('writes messages, prefixes, and instruction data', () => {
    const writes: string[] = [];
    const write = spyOn(console, 'write').mockImplementation(((...args: unknown[]) => {
      writes.push(args.join(''));
    }) as typeof console.write);

    try {
      const transport = new CLILogTransport();

      transport.write(
        record({
          prefix: 'api',
          level: {
            kind: 'OK',
            value: 40,
          },
          message: 'Generated',
          data: [['src/main.ts', 123]],
        }),
      );

      expect(writes.join('')).toContain('api');
      expect(writes.join('')).toContain('Generated');
      expect(writes.join('')).toContain('src/main.ts');
    } finally {
      write.mockRestore();
    }
  });

  it('formats CLI exceptions and generic errors differently', () => {
    const writes: string[] = [];
    const write = spyOn(console, 'write').mockImplementation(((...args: unknown[]) => {
      writes.push(args.join(''));
    }) as typeof console.write);

    try {
      const transport = new CLILogTransport();

      transport.write(
        record({
          level: {
            kind: 'ERROR',
            value: 50,
          },
          message: 'Not used',
          error: new CLIException('Invalid project', 'Run init'),
        }),
      );
      transport.write(
        record({
          level: {
            kind: 'ERROR',
            value: 50,
          },
          error: new Error('Boom'),
        }),
      );

      const output = writes.join('');
      expect(output).toContain('Not used');
      expect(output).toContain('Run init');
      expect(output).toContain('Boom');
    } finally {
      write.mockRestore();
    }
  });
});
