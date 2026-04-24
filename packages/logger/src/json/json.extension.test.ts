import { describe, expect, it } from 'bun:test';
import { JSONExtension } from './json.extension';

describe('JSONExtension', () => {
  it('formats log options as structured JSON records', () => {
    const extension = new JSONExtension();
    const error = new Error('boom');
    const timestamp = new Date('2026-04-23T10:20:30.456Z');

    const record = JSON.parse(
      extension.formatLog({
        context: 'Test',
        traceId: 1,
        level: {
          name: 'ERROR',
          value: 50,
        },
        error,
        data: [{ extra: true }],
        timestamp,
        duration: 12,
      }),
    );

    expect(record).toEqual({
      id: expect.any(Number),
      level: 50,
      context: 'Test',
      traceId: 1,
      message: 'boom',
      error: {
        name: 'Error',
        stack: expect.any(String),
      },
      data: [{ extra: true }],
      timestamp: timestamp.toISOString(),
      duration: 12,
    });
  });

  it('increments record ids', () => {
    const first = JSONExtension.nextId;
    const second = JSONExtension.nextId;

    expect(second).toBe(first + 1);
  });
});
