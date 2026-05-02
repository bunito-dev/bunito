import { isFn, isString } from '@bunito/common';
import { ConfigException } from '../config.exception';
import type { ConfigService } from '../config.service';
import type { ConfigEnvKey, ConfigFlag } from '../types';
import type {
  ConfigFormat,
  ConfigKeyLike,
  ConfigKind,
  ConfigParser,
  ResolveConfigFormat,
  ResolveConfigParser,
} from './types';
import { formatConfigValue } from './utils';

export class ConfigHelper {
  constructor(
    private readonly configName: string,
    private readonly configService: ConfigService,
  ) {
    this.getFlag = this.getFlag.bind(this);
    this.getEnv = this.getEnv.bind(this);
    this.getValue = this.getValue.bind(this);
    this.getSecret = this.getSecret.bind(this);
  }

  getFlag(flag: ConfigFlag): boolean {
    return this.configService.getFlag(flag);
  }

  getEnv<TFormat extends ConfigFormat>(
    keyLike: ConfigKeyLike<ConfigEnvKey>,
    format: TFormat,
  ): ResolveConfigFormat<TFormat> | undefined;
  getEnv<
    TFormat extends ConfigFormat,
    TParser extends ConfigParser<unknown, ResolveConfigFormat<TFormat>>,
  >(
    keyLike: ConfigKeyLike<ConfigEnvKey>,
    format: TFormat,
    parser: TParser,
  ): ResolveConfigParser<TParser> | undefined;
  getEnv(keyLike: ConfigKeyLike<ConfigEnvKey>): string | undefined;
  getEnv(
    keyLike: ConfigKeyLike<ConfigEnvKey>,
    format?: ConfigFormat,
    parser?: ConfigParser,
  ): unknown {
    let key: string | undefined;
    let value: unknown;

    if (isString(keyLike)) {
      [key, value] = [keyLike, this.configService.getEnv(keyLike)];
    } else if (Array.isArray(keyLike)) {
      for (const k of keyLike) {
        [key, value] = [k, this.configService.getEnv(k)];

        if (value !== undefined) {
          break;
        }
      }
    }

    return this.processRawValue('env', key, value, format, parser);
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
      [key, value] = [keyLike, await this.configService.getValue(keyLike)];
    } else if (Array.isArray(keyLike)) {
      for (const k of keyLike) {
        [key, value] = [k, await this.configService.getValue(k)];

        if (value !== undefined) {
          break;
        }
      }
    }

    return this.processRawValue('value', key, value, format, parser);
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
      [key, value] = [keyLike, await this.configService.getSecret(keyLike)];
    } else if (Array.isArray(keyLike)) {
      for (const k of keyLike) {
        [key, value] = [k, await this.configService.getSecret(k)];

        if (value !== undefined) {
          break;
        }
      }
    }

    return this.processRawValue('secret', key, value, format, parser);
  }

  private processRawValue(
    kind: ConfigKind,
    key: string | undefined,
    value: unknown,
    format: ConfigFormat | undefined,
    parser: ConfigParser | undefined,
  ): unknown {
    if (key === undefined || value === undefined || !format) {
      return value;
    }

    const formatted = formatConfigValue(value, format);

    if (formatted === undefined || !isFn(parser)) {
      return formatted;
    }

    try {
      return parser(formatted);
    } catch (err) {
      throw new ConfigException(
        `Failed to parse ${kind} config ${this.configName}.${key}`,
        err,
      );
    }
  }
}
