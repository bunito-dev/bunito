import { describe, expect, it } from 'bun:test';
import { ConfigService } from '../config';
import { LoggerConfig } from './logger.config';

describe('LoggerConfig', () => {
  it('should create a singleton config provider for logger settings', async () => {
    const service = {
      isCI: false,
      getEnvAs: () => undefined,
    } as unknown as ConfigService;

    expect(typeof LoggerConfig.token).toBe('symbol');
    expect(String(LoggerConfig.token)).toBe('Symbol(LoggerConfig)');
    expect(LoggerConfig.scope).toBe('singleton');
    expect(LoggerConfig.injects).toEqual([ConfigService]);
    expect(await LoggerConfig.useFactory(service)).toEqual({
      level: 'DEBUG',
      format: 'prettify',
    });
  });

  it('should prefer env-derived values over CI defaults', async () => {
    const service = {
      isCI: true,
      getEnvAs(key: string, format: string) {
        if (key === 'LOG_LEVEL' && format === 'toUpperCase') {
          return 'ERROR';
        }

        if (key === 'LOG_FORMAT' && format === 'toLowerCase') {
          return 'json';
        }

        return undefined;
      },
    } as unknown as ConfigService;

    expect(await LoggerConfig.useFactory(service)).toEqual({
      level: 'ERROR',
      format: 'json',
    });
  });
});
