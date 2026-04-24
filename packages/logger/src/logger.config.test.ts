import { describe, expect, it } from 'bun:test';
import { LoggerConfig } from './logger.config';

describe('LoggerConfig', () => {
  it('resolves explicit environment values and CI defaults', async () => {
    expect('useFactory' in LoggerConfig).toBeTrue();
    if (!('useFactory' in LoggerConfig)) {
      throw new Error('Expected logger config factory');
    }

    expect(
      await LoggerConfig.useFactory({
        isCI: false,
        isDev: false,
        getEnv: ((key: string, format?: string) => {
          switch (`${key}:${format ?? ''}`) {
            case 'LOG_LEVEL:toUpperCase':
              return 'ERROR';
            case 'LOG_FORMAT:toLowerCase':
              return 'json';
            default:
              return undefined;
          }
        }) as never,
      } as never),
    ).toEqual({
      level: 'ERROR',
      format: 'json',
    });

    expect(
      await LoggerConfig.useFactory({
        isCI: true,
        isDev: false,
        getEnv: (() => undefined) as never,
      } as never),
    ).toEqual({
      level: 'INFO',
      format: 'json',
    });

    expect(
      await LoggerConfig.useFactory({
        isCI: false,
        isDev: true,
        getEnv: (() => undefined) as never,
      } as never),
    ).toEqual({
      level: 'DEBUG',
      format: 'pretty',
    });
  });
});
