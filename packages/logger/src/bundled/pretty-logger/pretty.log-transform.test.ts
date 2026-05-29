import { describe, expect, it, spyOn } from 'bun:test';
import { PrettyLogTransform } from './pretty.log-transform';

describe('PrettyTransform', () => {
  it('formats and writes readable log records', () => {
    const log = spyOn(console, 'log').mockImplementation(() => undefined);
    const transform = new PrettyLogTransform({
      disableColor: true,
      inspectDepth: 1,
    });
    const error = new Error('Boom');
    const record = {
      level: {
        kind: 'INFO' as const,
        value: 50,
      },
      timestamp: new Date('2026-01-01T12:34:56.789Z'),
      context: 'Job',
      requestId: 7,
      message: 'Done',
      duration: 1250,
      error,
      data: ['note', [{ nested: { value: true } }], { ok: true }],
    };

    try {
      const formatted = transform.format(record);
      transform.write(record);

      expect(formatted).toContain('INFO');
      expect(formatted).toContain('[Job]');
      expect(formatted).toContain('Done');
      expect(formatted).toContain('⌗7');
      expect(formatted).toContain('Boom');
      expect(formatted).toContain('note');
      expect(formatted).toContain('[0]');
      expect(formatted).toContain('ok');
      expect(log).toHaveBeenCalledWith(formatted);
    } finally {
      log.mockRestore();
    }
  });

  it('keeps formatting plain when no colors are requested', () => {
    const transform = new PrettyLogTransform({
      disableColor: false,
      inspectDepth: 1,
    });

    expect(
      transform.format({
        level: {
          kind: 'DEBUG',
          value: 60,
        },
        timestamp: new Date(),
      }),
    ).toContain('DEBUG');
  });
});
