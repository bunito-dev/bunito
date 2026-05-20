import { describe, expect, it, spyOn } from 'bun:test';
import { JSONTransform } from './json-transform';

describe('JSONTransform', () => {
  it('formats and writes JSON log records', () => {
    const log = spyOn(console, 'log').mockImplementation(() => undefined);
    const transform = new JSONTransform();
    const error = new Error('Boom');
    const record = {
      level: {
        kind: 'ERROR' as const,
        value: 20,
      },
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
      context: 'Job',
      error,
    };

    try {
      const formatted = transform.format(record);
      transform.write(record);

      expect(formatted).toEqual({
        traceId: expect.any(Number),
        level: 20,
        timestamp: record.timestamp,
        context: 'Job',
        message: 'Boom',
        err: {
          name: 'Error',
          stack: error.stack,
        },
      });
      const [written] = log.mock.calls[0] ?? [];
      expect(JSON.parse(written as string)).toEqual({
        ...formatted,
        traceId: expect.any(Number),
        timestamp: record.timestamp.toISOString(),
      });
    } finally {
      log.mockRestore();
    }
  });
});
