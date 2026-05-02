import { describe, expect, it } from 'bun:test';
import { JSONLogFormatter } from './json.log-formatter';

describe('JSONLogFormatter', () => {
  it('formats log options as structured JSON records', () => {
    const error = new Error('Boom');
    const formatter = new JSONLogFormatter();
    const output = formatter.formatLog({
      level: {
        name: 'ERROR',
        value: 50,
      },
      context: 'Context',
      traceId: 7,
      message: undefined,
      error,
      data: [{ value: true }],
      timestamp: new Date('2026-05-02T10:00:00.000Z'),
      duration: 12,
    });
    const record = JSON.parse(output);

    expect(record).toEqual({
      id: expect.any(Number),
      level: 50,
      context: 'Context',
      traceId: 7,
      message: 'Boom',
      error: {
        name: 'Error',
        stack: expect.any(String),
      },
      data: [{ value: true }],
      timestamp: '2026-05-02T10:00:00.000Z',
      duration: 12,
    });
  });
});
