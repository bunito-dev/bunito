import { afterEach, describe, expect, it } from 'bun:test';
import { ConfigService } from './config.service';
import type { ConfigReader } from './reader';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  process.env.CI = originalEnv.CI;
  process.env.TEST_CONFIG_VALUE = originalEnv.TEST_CONFIG_VALUE;
});

describe('ConfigService', () => {
  it('creates helpers and reads trimmed environment values', () => {
    process.env.TEST_CONFIG_VALUE = '  value  ';
    const configService = new ConfigService();

    expect(configService.createHelper('Feature')).toBeDefined();
    expect(configService.getEnv('TEST_CONFIG_VALUE')).toBe('value');

    process.env.TEST_CONFIG_VALUE = '   ';
    expect(configService.getEnv('TEST_CONFIG_VALUE')).toBeUndefined();
  });

  it('resolves runtime flags from NODE_ENV and CI', () => {
    process.env.NODE_ENV = 'production';
    process.env.CI = undefined;
    const prodService = new ConfigService();

    expect(prodService.getFlag('prod')).toBeTrue();
    expect(prodService.getFlag('dev')).toBeFalse();

    process.env.NODE_ENV = 'test';
    const testService = new ConfigService();

    expect(testService.getFlag('test')).toBeTrue();

    process.env.NODE_ENV = 'development';
    process.env.CI = 'true';
    const ciService = new ConfigService();

    expect(ciService.getFlag('ci')).toBeTrue();
    expect(ciService.getFlag('prod')).toBeFalse();
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
