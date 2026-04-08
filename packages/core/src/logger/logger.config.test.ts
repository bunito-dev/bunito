import { describe, expect, it } from 'bun:test';
import { LoggerConfig } from './logger.config';

describe('LoggerConfig', () => {
  it('should register a module-scoped config provider', async () => {
    const service = {
      whenCI: <TValue>(_ciValue: TValue, nonCiValue: TValue): TValue => nonCiValue,
      getEnv: () => undefined,
    };

    expect(typeof LoggerConfig.token).toBe('symbol');
    expect(String(LoggerConfig.token)).toBe('Symbol(config(logger))');
    expect(LoggerConfig.scope).toBe('module');
    expect(LoggerConfig.injects).toEqual([expect.any(Function)]);
    expect(await LoggerConfig.useFactory(service)).toEqual({
      level: 'DEBUG',
      format: 'prettify',
    });
  });

  it('should prefer env-derived values over CI defaults', async () => {
    const service = {
      whenCI: <TValue>(ciValue: TValue, _nonCiValue: TValue): TValue => ciValue,
      getEnv: (key: string, parser?: (value: string) => unknown) => {
        const values: Record<string, string> = {
          LOG_LEVEL: 'ERROR',
          LOG_FORMAT: 'JSON',
        };
        const value = values[key];

        return value && parser ? parser(value) : value;
      },
    };

    expect(await LoggerConfig.useFactory(service)).toEqual({
      level: 'ERROR',
      format: 'json',
    });
  });
});
