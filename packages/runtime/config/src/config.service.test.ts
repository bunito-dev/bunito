import { describe, expect, it } from 'bun:test';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  it('reads environment values through formats and parsers', () => {
    const previousEnv = { ...process.env };

    process.env.CI = 'true';
    process.env.PORT = ' 3000 ';
    process.env.LOG_LEVEL = 'debug';
    process.env.FALLBACK = 'fallback';
    process.env.JSON_VALUE = '{"ok":true}';

    const service = new ConfigService();

    expect(service.isCI).toBe(true);
    expect(service.getEnv('PORT')).toBe('3000');
    expect(service.getEnv('PORT', 'port')).toBe(3000);
    expect(service.getEnv('LOG_LEVEL', 'toUpperCase', ['DEBUG'])).toBe('DEBUG');
    expect(service.getEnv(['MISSING', 'FALLBACK'], 'string')).toBe('fallback');
    expect(
      service.getEnv('JSON_VALUE', (value) => JSON.parse(value) as { ok: boolean }),
    ).toEqual({ ok: true });
    expect(
      service.getEnv('PORT', {
        safeParse: (data) =>
          data === '3000'
            ? { success: true as const, data: 3000 }
            : { success: false as const },
      }),
    ).toBe(3000);
    expect(
      service.getEnv('PORT', {
        safeParse: () => ({ success: false as const }),
      }),
    ).toBeUndefined();
    expect(service.getEnv('UNKNOWN')).toBeUndefined();

    process.env = previousEnv;
  });
});
