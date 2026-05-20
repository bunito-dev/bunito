import { describe, expect, it } from 'bun:test';
import { ConfigService } from '@bunito/config';
import { LoggerConfig } from './logger-config';

describe('LoggerConfig', () => {
  it('resolves defaults and production defaults', async () => {
    if (!('useFactory' in LoggerConfig)) {
      throw new Error('Expected LoggerConfig factory provider');
    }

    expect(await LoggerConfig.useFactory(new ConfigService())).toEqual({
      level: 'DEBUG',
      transport: 'pretty',
      exitOnFatal: true,
    });
    expect(
      await LoggerConfig.useFactory(
        new ConfigService(null, {
          NODE_ENV: 'production',
        }),
      ),
    ).toEqual({
      level: 'INFO',
      transport: 'json',
      exitOnFatal: true,
    });
  });

  it('reads explicit env values and rejects unsupported log levels', async () => {
    if (!('useFactory' in LoggerConfig)) {
      throw new Error('Expected LoggerConfig factory provider');
    }

    expect(
      await LoggerConfig.useFactory(
        new ConfigService(null, {
          LOG_LEVEL: 'warn',
          LOG_TRANSPORT: 'json',
          EXIT_ON_FATAL: 'false',
        }),
      ),
    ).toEqual({
      level: 'WARN',
      transport: 'json',
      exitOnFatal: false,
    });

    let error: unknown;
    try {
      await LoggerConfig.useFactory(
        new ConfigService(null, {
          LOG_LEVEL: 'nope',
        }),
      );
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      'config(Logger): Failed to process config LOG_LEVEL env',
    );
  });
});
