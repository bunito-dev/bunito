import { describe, expect, it } from 'bun:test';
import { InternalException } from '@bunito/common';
import type { ConfigReader } from './config-reader';
import { ConfigService } from './config-service';

describe('ConfigService', () => {
  it('reads trimmed environment values by single key or aliases', () => {
    const envs = {
      TEST_CONFIG_VALUE: '  value  ',
      OTHER_CONFIG_VALUE: '42',
    };
    const configService = new ConfigService(null, envs);

    expect(configService.getEnv('TEST_CONFIG_VALUE')).toBe('value');
    expect(
      configService.getEnv(['MISSING_CONFIG_VALUE', 'OTHER_CONFIG_VALUE'], 'integer'),
    ).toBe(42);
    expect(configService.getEnv({} as never)).toBeUndefined();

    expect(
      new ConfigService(null, {
        TEST_CONFIG_VALUE: '   ',
      }).getEnv('TEST_CONFIG_VALUE'),
    ).toBeUndefined();
  });

  it('resolves runtime flags from NODE_ENV and CI', () => {
    const prodService = new ConfigService(null, {
      NODE_ENV: 'production',
    });

    expect(prodService.getFlag('isProd')).toBeTrue();
    expect(prodService.whenProd('on', 'off')).toBe('on');
    expect(prodService.getFlag('isDev')).toBeFalse();

    const testService = new ConfigService(null, {
      NODE_ENV: 'test',
    });

    expect(testService.getFlag('isTest')).toBeTrue();
    expect(testService.whenTest('on', 'off')).toBe('on');

    const ciService = new ConfigService(null, {
      NODE_ENV: 'development',
      CI: 'true',
    });

    expect(ciService.getFlag('isCI')).toBeTrue();
    expect(ciService.whenCI('on', 'off')).toBe('on');
    expect(ciService.getFlag('isProd')).toBeFalse();

    const devService = new ConfigService(null, {
      NODE_ENV: 'development',
    });

    expect(devService.getFlag('isDev')).toBeTrue();
    expect(devService.whenDev('on', 'off')).toBe('on');
  });

  it('reads values and secrets from the first reader that returns a value', async () => {
    const readers: ConfigReader[] = [
      {
        NAME: 'empty',
        getValue: async () => undefined,
        getSecret: async () => undefined,
      },
      {
        NAME: 'memory',
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

  it('uses only active readers selected by the environment', async () => {
    const configService = new ConfigService(
      [
        {
          NAME: 'first',
          getValue: async () => 'first',
        },
        {
          NAME: 'second',
          getValue: async () => 'second',
        },
      ],
      {
        CONFIG_READERS: 'second',
      },
    );

    const value = await configService.getValue('api.url');

    expect(value).toBe('second');
  });

  it('reads values and secrets by aliases and wraps parser failures', async () => {
    const configService = new ConfigService([
      {
        NAME: 'memory',
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
    expect(valueError).toBeInstanceOf(InternalException);
    expect((valueError as Error).message).toBe(
      'Failed to process config value.second value',
    );
    expect(secretError).toBeInstanceOf(InternalException);
    expect((secretError as Error).message).toBe(
      'Failed to process config secret.second secret',
    );
  });

  it('wraps environment parser failures', () => {
    const configService = new ConfigService(null, {
      TEST_CONFIG_VALUE: 'value',
    });

    expect(() => {
      configService.getEnv('TEST_CONFIG_VALUE', 'string', () => {
        throw new Error('Parser failed');
      });
    }).toThrow('Failed to process config TEST_CONFIG_VALUE env');
  });

  it('skips readers that do not implement a requested method', async () => {
    const configService = new ConfigService([
      {
        NAME: 'memory',
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
