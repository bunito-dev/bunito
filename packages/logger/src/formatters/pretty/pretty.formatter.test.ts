import { describe, expect, it } from 'bun:test';
import { PrettyFormatter } from './pretty.formatter';
import { formatDuration } from './utils';

describe('PrettyFormatter', () => {
  describe('formatLog', () => {
    it('formats logs in a readable pretty format', () => {
      const formatter = new PrettyFormatter({
        colors: false,
        inspectDepth: 3,
      });

      const result = formatter.formatLog({
        level: { name: 'ERROR', value: 50 },
        message: 'pretty-message',
        data: ['line', { ok: true }],
        error: new Error('boom'),
        timestamp: '2026-01-01T00:00:00.000Z',
        context: 'Pretty',
        traceId: 4,
        duration: 1001,
      });

      expect(result).toContain('pretty-message');
      expect(result).toContain('[Pretty]');
      expect(result).toContain('#4');
      expect(result).toContain('∙ line');
      expect(result).toContain(formatDuration(1001));
    });
  });
});
