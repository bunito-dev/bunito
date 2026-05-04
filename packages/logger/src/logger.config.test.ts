import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config/internals';
import { LoggerConfig } from './logger.config';

const originalEnv = { ...process.env };

afterEach(() => {
  restoreEnv('NODE_ENV');
  restoreEnv('CI');
  restoreEnv('LOG_FORMAT');
  restoreEnv('LOG_LEVEL');
});

function restoreEnv(key: string): void {
  const value = originalEnv[key];

  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

describe('LoggerConfig', () => {
  it('resolves explicit environment values', async () => {
    process.env.LOG_FORMAT = 'PRETTY';
    process.env.LOG_LEVEL = 'debug';
    const configService = new ConfigService();

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

    process.env.NODE_ENV = 'development';
    delete process.env.CI;
    delete process.env.LOG_FORMAT;
    delete process.env.LOG_LEVEL;
    const devConfig = await LoggerConfig.useFactory(new ConfigService());

    process.env.NODE_ENV = 'production';
    const prodConfig = await LoggerConfig.useFactory(new ConfigService());

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

    process.env.LOG_LEVEL = 'unknown';

    let error: unknown;
    try {
      await LoggerConfig.useFactory(new ConfigService());
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
