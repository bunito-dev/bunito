import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config/internals';
import { LoggerConfig } from './logger.config';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  process.env.CI = originalEnv.CI;
  process.env.LOG_FORMAT = originalEnv.LOG_FORMAT;
  process.env.LOG_LEVEL = originalEnv.LOG_LEVEL;
});

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
    process.env.LOG_FORMAT = undefined;
    process.env.LOG_LEVEL = 'unknown';
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
});
