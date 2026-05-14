import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { LoggerConfig } from './logger-config';

describe('LoggerConfig', () => {
  it('resolves explicit environment values', async () => {
    const configService = new ConfigService(null, {
      LOG_FORMAT: 'PRETTY',
      LOG_LEVEL: 'debug',
    });

    if (!('useFactory' in LoggerConfig)) {
      throw new Error('Expected LoggerConfig factory provider');
    }

    const config = await LoggerConfig.useFactory(configService);

    expect(config).toEqual({
      format: 'pretty',
      level: 'DEBUG',
    });
  });

  it('falls back to dev and non-dev defaults', async () => {
    if (!('useFactory' in LoggerConfig)) {
      throw new Error('Expected LoggerConfig factory provider');
    }

    const devConfig = await LoggerConfig.useFactory(
      new ConfigService(null, {
        NODE_ENV: 'development',
      }),
    );

    const prodConfig = await LoggerConfig.useFactory(
      new ConfigService(null, {
        NODE_ENV: 'production',
      }),
    );

    expect(devConfig).toEqual({
      format: 'pretty',
      level: 'DEBUG',
    });
    expect(prodConfig).toEqual({
      format: 'json',
      level: 'INFO',
    });
  });

  it('rejects invalid log levels from the environment', async () => {
    if (!('useFactory' in LoggerConfig)) {
      throw new Error('Expected LoggerConfig factory provider');
    }

    let error: unknown;
    try {
      await LoggerConfig.useFactory(
        new ConfigService(null, {
          LOG_LEVEL: 'unknown',
        }),
      );
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'Logger: Failed to process config LOG_LEVEL env',
    );
    expect((error as Error).cause).toBeInstanceOf(Error);
    expect(((error as Error).cause as Error).message).toBe('Invalid log level: UNKNOWN');
  });
});
