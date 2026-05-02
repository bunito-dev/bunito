import * as process from 'node:process';
import { isFn } from '@bunito/common';
import { Provider } from '@bunito/container';
import { ConfigHelper } from './helper';
import { ConfigReader } from './reader';
import type { ConfigEnvKey, ConfigFlag } from './types';

@Provider({
  scope: 'singleton',
  global: true,
  injects: [
    {
      useToken: ConfigReader,
      optional: true,
    },
  ],
})
export class ConfigService {
  private readonly flags: Record<ConfigFlag, boolean>;

  constructor(private readonly readers: ConfigReader[] | null = null) {
    const { NODE_ENV, CI } = process.env;

    const nodeEnv = NODE_ENV?.toLowerCase() as typeof NODE_ENV;

    const ci = CI?.toLowerCase() === 'true' || nodeEnv === 'ci';
    const prod = nodeEnv === 'production' && !ci;
    const test = nodeEnv === 'test' && !ci;

    this.flags = {
      ci,
      prod,
      test,
      dev: !ci && !prod && !test,
    };
  }

  createHelper(configName: string): ConfigHelper {
    return new ConfigHelper(configName, this);
  }

  getFlag(flag: ConfigFlag): boolean {
    return this.flags[flag];
  }

  getEnv(key: ConfigEnvKey): string | undefined {
    const value = process.env[key]?.trim();
    return value ? value : undefined;
  }

  getValue(key: string): Promise<unknown> {
    return this.callReader('getValue', key);
  }

  getSecret(key: string): Promise<unknown> {
    return this.callReader('getSecret', key);
  }

  private async callReader(propKey: keyof ConfigReader, key: string): Promise<unknown> {
    if (!this.readers) {
      return;
    }

    for (const reader of this.readers) {
      if (!isFn(reader[propKey])) {
        continue;
      }

      const value = await reader[propKey](key);

      if (value !== undefined) {
        return value;
      }
    }
  }
}
