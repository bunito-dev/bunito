import * as process from 'node:process';
import { ConfigurationException, isFn, isObject, isString } from '@bunito/common';
import { Container, OnInit, Provider } from '@bunito/container';
import type { ConfigExtension } from './config.extension';
import { CONFIG_EXTENSION } from './constants';
import type {
  EnvKeyLike,
  SecretKeyLike,
  ValueFormat,
  ValueNumberFormat,
  ValueNumberOptions,
  ValueParser,
  ValueStringFormat,
} from './types';
import { formatValue } from './utils';

@Provider({
  scope: 'singleton',
  global: true,
  injects: [Container],
})
export class ConfigService {
  readonly isCI: boolean;

  readonly isProd: boolean;

  readonly isTest: boolean;

  readonly isDev: boolean;

  private readonly extensions: ConfigExtension[] = [];

  constructor(private readonly container: Container) {
    this.getEnv = this.getEnv.bind(this);

    const envName = process.env.NODE_ENV?.toLowerCase();
    const envCI = process.env.CI?.toLowerCase() === 'true';

    this.isCI = envName === 'ci' || envCI;
    this.isProd = envName === 'production';
    this.isTest = envName === 'test';
    this.isDev = !this.isCI && !this.isProd && !this.isTest;
  }

  @OnInit()
  async configure(): Promise<void> {
    for (const { providerId, moduleId } of this.container.getExtensions(
      CONFIG_EXTENSION,
    )) {
      const extension = await this.container.resolveProvider<ConfigExtension>(
        providerId,
        {
          moduleId,
        },
      );

      if (!isObject(extension) || !isFn(extension.getSecret)) {
        return ConfigurationException.throw`${extension} is not a valid ConfigExtension`;
      }

      this.extensions.push(extension);
    }
  }

  getEnv(keyLike: EnvKeyLike): string | undefined;
  getEnv(keyLike: EnvKeyLike, format: 'boolean'): boolean | undefined;
  getEnv(keyLike: EnvKeyLike, format: 'port'): number | undefined;
  getEnv(
    keyLike: EnvKeyLike,
    format: ValueNumberFormat,
    options?: ValueNumberOptions,
  ): number | undefined;
  getEnv<TValue extends string>(
    keyLike: EnvKeyLike,
    format: ValueStringFormat,
    options?: ArrayLike<string>,
  ): TValue | undefined;
  getEnv<TOutput = string>(
    keyLike: EnvKeyLike,
    parser: ValueParser<TOutput>,
  ): TOutput | undefined;
  getEnv(
    keyLike: EnvKeyLike,
    formatOrParser?: ValueFormat | ValueParser,
    formatOptions?: unknown,
  ): unknown {
    return formatValue(this.getRawEnv(keyLike), formatOrParser, formatOptions);
  }

  getSecret(keyLike: SecretKeyLike): Promise<unknown>;
  getSecret(keyLike: SecretKeyLike, format: 'boolean'): Promise<boolean | undefined>;
  getSecret(keyLike: SecretKeyLike, format: 'port'): Promise<number | undefined>;
  getSecret(
    keyLike: SecretKeyLike,
    format: ValueNumberFormat,
    options?: ValueNumberOptions,
  ): Promise<number | undefined>;
  getSecret<TValue extends string>(
    keyLike: SecretKeyLike,
    format: ValueStringFormat,
    options?: ArrayLike<string>,
  ): Promise<TValue | undefined>;
  getSecret<TOutput = string>(
    keyLike: SecretKeyLike,
    parser: ValueParser<TOutput>,
  ): Promise<TOutput | undefined>;
  async getSecret(
    keyLike: SecretKeyLike,
    formatOrParser?: ValueFormat | ValueParser,
    formatOptions?: unknown,
  ): Promise<unknown> {
    return formatValue(await this.getRawSecret(keyLike), formatOrParser, formatOptions);
  }

  private getRawEnv(keyLike: EnvKeyLike): string | undefined {
    if (isString(keyLike)) {
      return process.env[keyLike]?.trim();
    }

    if (Array.isArray(keyLike)) {
      for (const key of keyLike) {
        const value = this.getRawEnv(key);

        if (value) {
          return value;
        }
      }
    }
  }

  private async getRawSecret(keyLike: SecretKeyLike): Promise<unknown> {
    if (!this.extensions.length) {
      return;
    }

    if (isString(keyLike)) {
      for (const extension of this.extensions) {
        const secret = await extension.getSecret(keyLike);

        if (secret !== undefined) {
          return secret;
        }
      }

      return;
    }

    if (Array.isArray(keyLike)) {
      for (const key of keyLike) {
        const secret = await this.getRawSecret(key);

        if (secret !== undefined) {
          return secret;
        }
      }
    }
  }
}
