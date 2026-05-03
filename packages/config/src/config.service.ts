import * as process from 'node:process';
import { isFn, isNullish, isString } from '@bunito/common';
import { Provider } from '@bunito/container';
import { ConfigException } from './config.exception';
import { ConfigReader } from './reader';
import type {
  ConfigEnv,
  ConfigFlag,
  ConfigFormat,
  ConfigKeyLike,
  ConfigParser,
  ResolveConfigFormat,
  ResolveConfigParser,
} from './types';
import { processConfigValue } from './utils';

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

    const nodeEnv = NODE_ENV?.toLowerCase();

    const isCI = CI?.toLowerCase() === 'true' || nodeEnv === 'ci';
    const isProd = nodeEnv === 'production' || nodeEnv === 'prod';
    const isTest = nodeEnv === 'test';

    this.flags = {
      isCI,
      isProd,
      isTest,
      isDev: !isCI && !isProd && !isTest,
    };

    this.whenCI = this.whenCI.bind(this);
    this.whenProd = this.whenProd.bind(this);
    this.whenTest = this.whenTest.bind(this);
    this.whenDev = this.whenDev.bind(this);
    this.getFlag = this.getFlag.bind(this);
    this.getEnv = this.getEnv.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getSecret = this.getSecret.bind(this);
  }

  whenCI<TValue>(on: TValue, off: TValue): TValue {
    return this.flags.isCI ? on : off;
  }

  whenProd<TValue>(on: TValue, off: TValue): TValue {
    return this.flags.isProd ? on : off;
  }

  whenTest<TValue>(on: TValue, off: TValue): TValue {
    return this.flags.isTest ? on : off;
  }

  whenDev<TValue>(on: TValue, off: TValue): TValue {
    return this.flags.isDev ? on : off;
  }

  getFlag(flag: ConfigFlag): boolean {
    return this.flags[flag];
  }

  getEnv<TFormat extends ConfigFormat>(
    keyLike: ConfigKeyLike<ConfigEnv>,
    format: TFormat,
  ): ResolveConfigFormat<TFormat> | undefined;
  getEnv<
    TFormat extends ConfigFormat,
    TParser extends ConfigParser<unknown, ResolveConfigFormat<TFormat>>,
  >(
    keyLike: ConfigKeyLike<ConfigEnv>,
    format: TFormat,
    parser: TParser,
  ): ResolveConfigParser<TParser> | undefined;
  getEnv(keyLike: ConfigKeyLike<ConfigEnv>): string | undefined;
  getEnv(
    keyLike: ConfigKeyLike<ConfigEnv>,
    format?: ConfigFormat,
    parser?: ConfigParser,
  ): unknown {
    let key: string | undefined;
    let value: unknown;

    if (isString(keyLike)) {
      [key, value] = [keyLike, this.readEnv(keyLike)];
    } else if (Array.isArray(keyLike)) {
      for (const k of keyLike) {
        [key, value] = [k, this.readEnv(k)];

        if (!isNullish(value)) {
          break;
        }
      }
    }

    try {
      return processConfigValue(value, format, parser);
    } catch (err) {
      throw new ConfigException(`Failed to process config ${key} env`, err);
    }
  }

  getValue<TFormat extends ConfigFormat>(
    keyLike: ConfigKeyLike,
    format: TFormat,
  ): Promise<ResolveConfigFormat<TFormat> | undefined>;
  getValue<
    TFormat extends ConfigFormat,
    TParser extends ConfigParser<unknown, ResolveConfigFormat<TFormat>>,
  >(
    keyLike: ConfigKeyLike,
    format: TFormat,
    parser: TParser,
  ): Promise<ResolveConfigParser<TParser> | undefined>;
  getValue(keyLike: ConfigKeyLike): Promise<string | undefined>;
  async getValue(
    keyLike: ConfigKeyLike,
    format?: ConfigFormat,
    parser?: ConfigParser,
  ): Promise<unknown> {
    let key: string | undefined;
    let value: unknown;

    if (isString(keyLike)) {
      [key, value] = [keyLike, await this.callReader('getValue', keyLike)];
    } else if (Array.isArray(keyLike)) {
      for (const k of keyLike) {
        [key, value] = [k, await this.callReader('getValue', k)];

        if (!isNullish(value)) {
          break;
        }
      }
    }

    try {
      return processConfigValue(value, format, parser);
    } catch (err) {
      throw new ConfigException(`Failed to process config ${key} value`, err);
    }
  }

  getSecret<TFormat extends ConfigFormat>(
    keyLike: ConfigKeyLike,
    format: TFormat,
  ): Promise<ResolveConfigFormat<TFormat> | undefined>;
  getSecret<
    TFormat extends ConfigFormat,
    TParser extends ConfigParser<unknown, ResolveConfigFormat<TFormat>>,
  >(
    keyLike: ConfigKeyLike,
    format: TFormat,
    parser: TParser,
  ): Promise<ResolveConfigParser<TParser> | undefined>;
  getSecret(keyLike: ConfigKeyLike): Promise<string | undefined>;
  async getSecret(
    keyLike: ConfigKeyLike,
    format?: ConfigFormat,
    parser?: ConfigParser,
  ): Promise<unknown> {
    let key: string | undefined;
    let value: unknown;

    if (isString(keyLike)) {
      [key, value] = [keyLike, await this.callReader('getSecret', keyLike)];
    } else if (Array.isArray(keyLike)) {
      for (const k of keyLike) {
        [key, value] = [k, await this.callReader('getSecret', k)];

        if (!isNullish(value)) {
          break;
        }
      }
    }

    try {
      return processConfigValue(value, format, parser);
    } catch (err) {
      throw new ConfigException(`Failed to process config ${key} secret`, err);
    }
  }

  private readEnv(key: ConfigEnv): string | undefined {
    const value = process.env[key]?.trim();
    return value ? value : undefined;
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

      if (!isNullish(value)) {
        return value;
      }
    }
  }
}
