import { describe, expect, it } from 'bun:test';
import { LoggerConfig } from './logger.config';

describe('LoggerConfig', () => {
  it('resolves explicit environment values and CI defaults', async () => {
    expect(
      await LoggerConfig.useFactory({
        isCI: false,
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
        getEnv: (() => undefined) as never,
      } as never),
    ).toEqual({
      level: 'INFO',
      format: 'json',
    });
  });
});
