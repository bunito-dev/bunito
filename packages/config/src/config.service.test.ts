import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigException } from './config.exception';
import { ConfigService } from './config.service';
import type { ConfigReader } from './reader';

const originalEnv = { ...process.env };

afterEach(() => {
  restoreEnv('NODE_ENV');
  restoreEnv('CI');
  restoreEnv('TEST_CONFIG_VALUE');
  restoreEnv('OTHER_CONFIG_VALUE');
});

function restoreEnv(key: string): void {
  const value = originalEnv[key];

  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

describe('ConfigService', () => {
  it('reads trimmed environment values by single key or aliases', () => {
    process.env.TEST_CONFIG_VALUE = '  value  ';
    process.env.OTHER_CONFIG_VALUE = '42';
    const configService = new ConfigService();

    expect(configService.getEnv('TEST_CONFIG_VALUE')).toBe('value');
    expect(
      configService.getEnv(['MISSING_CONFIG_VALUE', 'OTHER_CONFIG_VALUE'], 'integer'),
    ).toBe(42);
    expect(configService.getEnv({} as never)).toBeUndefined();

    process.env.TEST_CONFIG_VALUE = '   ';
    expect(configService.getEnv('TEST_CONFIG_VALUE')).toBeUndefined();
  });

  it('resolves runtime flags from NODE_ENV and CI', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CI;
    const prodService = new ConfigService();

    expect(prodService.getFlag('isProd')).toBeTrue();
    expect(prodService.whenProd('on', 'off')).toBe('on');
    expect(prodService.getFlag('isDev')).toBeFalse();

    process.env.NODE_ENV = 'test';
    const testService = new ConfigService();

    expect(testService.getFlag('isTest')).toBeTrue();
    expect(testService.whenTest('on', 'off')).toBe('on');

    process.env.NODE_ENV = 'development';
    process.env.CI = 'true';
    const ciService = new ConfigService();

    expect(ciService.getFlag('isCI')).toBeTrue();
    expect(ciService.whenCI('on', 'off')).toBe('on');
    expect(ciService.getFlag('isProd')).toBeFalse();

    delete process.env.CI;
    const devService = new ConfigService();

    expect(devService.getFlag('isDev')).toBeTrue();
    expect(devService.whenDev('on', 'off')).toBe('on');
  });

  it('reads values and secrets from the first reader that returns a value', async () => {
    const readers: ConfigReader[] = [
      {
        getValue: async () => undefined,
        getSecret: async () => undefined,
      },
      {
        getValue: async (key) => `value:${key}`,
        getSecret: async (key) => `secret:${key}`,
      },
    ];
    const configService = new ConfigService(readers);

    const value = await configService.getValue('api.url');
    const secret = await configService.getSecret('api.token');

    expect(value).toBe('value:api.url');
    expect(secret).toBe('secret:api.token');
  });

  it('reads values and secrets by aliases and wraps parser failures', async () => {
    const configService = new ConfigService([
      {
        getValue: async (key) => (key === 'value.second' ? 'ON' : undefined),
        getSecret: async (key) => (key === 'secret.second' ? 'token' : undefined),
      },
    ]);

    const value = await configService.getValue(
      ['value.first', 'value.second'],
      'boolean',
    );
    const secret = await configService.getSecret(
      ['secret.first', 'secret.second'],
      'uppercase',
      (raw) => `parsed:${raw}`,
    );
    let valueError: unknown;
    try {
      await configService.getValue('value.second', 'string', () => {
        throw new Error('Parser failed');
      });
    } catch (error) {
      valueError = error;
    }
    let secretError: unknown;
    try {
      await configService.getSecret('secret.second', 'string', () => {
        throw new Error('Parser failed');
      });
    } catch (error) {
      secretError = error;
    }

    expect(value).toBeTrue();
    expect(secret).toBe('parsed:TOKEN');
    expect(valueError).toBeInstanceOf(ConfigException);
    expect((valueError as Error).message).toBe(
      'Failed to process config value.second value',
    );
    expect(secretError).toBeInstanceOf(ConfigException);
    expect((secretError as Error).message).toBe(
      'Failed to process config secret.second secret',
    );
  });

  it('wraps environment parser failures', () => {
    process.env.TEST_CONFIG_VALUE = 'value';
    const configService = new ConfigService();

    expect(() => {
      configService.getEnv('TEST_CONFIG_VALUE', 'string', () => {
        throw new Error('Parser failed');
      });
    }).toThrow('Failed to process config TEST_CONFIG_VALUE env');
  });

  it('skips readers that do not implement a requested method', async () => {
    const configService = new ConfigService([
      {
        getValue: async () => 'value',
      },
    ]);

    const value = await configService.getValue('key');
    const secret = await configService.getSecret('key');
    const missing = await new ConfigService().getValue('key');

    expect(value).toBe('value');
    expect(secret).toBeUndefined();
    expect(missing).toBeUndefined();
  });
});
