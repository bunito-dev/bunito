import { describe, expect, it } from 'bun:test';
import { JSONFormatter } from './json.formatter';

describe('JSONFormatter', () => {
  describe('formatLog', () => {
    it('formats logs as JSON records', () => {
      const formatter = new JSONFormatter();
      const result = JSON.parse(
        formatter.formatLog({
          level: { name: 'INFO', value: 30 },
          message: 'json-message',
          data: [{ ok: true }],
          error: new Error('boom'),
          timestamp: '2026-01-01T00:00:00.000Z',
          context: 'Test',
          traceId: 2,
          duration: 15,
        }),
      );

      expect(result).toMatchObject({
        id: expect.any(Number),
        level: 30,
        message: 'json-message',
        context: 'Test',
        traceId: 2,
        duration: 15,
      });
    });
  });
});
