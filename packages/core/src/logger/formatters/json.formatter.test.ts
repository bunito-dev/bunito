import { describe, expect, it } from 'bun:test';
import { JSONFormatter } from './json.formatter';

describe('JSONFormatter', () => {
  it('should increment ids and serialize log payloads', () => {
    const formatter = new JSONFormatter();
    const first = JSON.parse(
      formatter.formatLog({
        level: {
          kind: 'INFO',
          value: 30,
        },
        message: 'hello',
        context: 'App',
        traceId: 2,
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    );
    const second = JSON.parse(
      formatter.formatLog({
        level: {
          kind: 'ERROR',
          value: 50,
        },
        error: new Error('boom'),
        data: [{ foo: 'bar' }],
        duration: 10,
        timestamp: '2026-01-01T00:00:01.000Z',
      }),
    );
    const firstId = first.id as number;

    expect(first).toMatchObject({
      id: expect.any(Number),
      level: 30,
      context: 'App',
      traceId: 2,
      message: 'hello',
      timestamp: '2026-01-01T00:00:00.000Z',
    });
    expect(second.id).toBe(firstId + 1);
    expect(second).toMatchObject({
      level: 50,
      message: 'boom',
      error: {
        name: 'Error',
        stack: expect.any(String),
      },
      data: [{ foo: 'bar' }],
      duration: 10,
      timestamp: '2026-01-01T00:00:01.000Z',
    });
  });
});
