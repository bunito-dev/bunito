import { describe, expect, it } from 'bun:test';
import type { ConfigService } from '../config.service';
import type { ConfigEnvKey, ConfigFlag } from '../types';
import { ConfigHelper } from './config-helper';

describe('ConfigHelper', () => {
  it('delegates flags and resolves env values by single key or aliases', () => {
    const configService = {
      getFlag: (flag: ConfigFlag) => flag === 'dev',
      getEnv: (key: ConfigEnvKey) => (key === 'SECOND' ? '42' : undefined),
      getValue: async () => undefined,
      getSecret: async () => undefined,
    } as unknown as ConfigService;
    const helper = new ConfigHelper('Feature', configService);

    expect(helper.getFlag('dev')).toBeTrue();
    expect(helper.getEnv(['FIRST', 'SECOND'], 'integer')).toBe(42);
    expect(helper.getEnv('MISSING')).toBeUndefined();
  });

  it('resolves config values and secrets by single key or aliases', async () => {
    const configService = {
      getFlag: () => false,
      getEnv: () => undefined,
      getValue: async (key: string) => (key === 'value.second' ? 'ON' : undefined),
      getSecret: async (key: string) => (key === 'secret.second' ? 'token' : undefined),
    } as unknown as ConfigService;
    const helper = new ConfigHelper('Feature', configService);

    const value = await helper.getValue(['value.first', 'value.second'], 'boolean');
    const secret = await helper.getSecret(
      ['secret.first', 'secret.second'],
      'uppercase',
      (raw) => `parsed:${raw}`,
    );
    const missing = await helper.getSecret('missing');

    expect(value).toBeTrue();
    expect(secret).toBe('parsed:TOKEN');
    expect(missing).toBeUndefined();
  });

  it('returns undefined for unknown key shapes and wraps parser failures', () => {
    const configService = {
      getFlag: () => false,
      getEnv: () => 'value',
      getValue: async () => undefined,
      getSecret: async () => undefined,
    } as unknown as ConfigService;
    const helper = new ConfigHelper('Feature', configService);

    expect(helper.getEnv({} as never)).toBeUndefined();

    expect(() => {
      helper.getEnv('KEY', 'string', () => {
        throw new Error('Parser failed');
      });
    }).toThrow('Failed to parse env config Feature.KEY');
  });
});
