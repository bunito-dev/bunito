import type { Fn, Mandatory, MaybePromise } from '@bunito/common';
import type {
  ProviderFactoryOptions,
  ProviderValueOptions,
} from '@bunito/container/internals';
import type { ZodType } from 'zod';
import type { ConfigService } from './config.service';

export type ConfigBuilder<TConfig> = (
  this: ConfigService,
  configService: ConfigService,
) => MaybePromise<TConfig>;

export type ConfigProvider<TConfig> =
  | Mandatory<
      ProviderFactoryOptions<Promise<TConfig>, [configService?: ConfigService]>,
      'token'
    >
  | ProviderValueOptions<TConfig>;

export type ResolveConfig<TValue> =
  TValue extends ConfigProvider<infer TConfig> ? Awaited<TConfig> : TValue;

export type ConfigFlag = 'isCI' | 'isProd' | 'isDev' | 'isTest';

export type ConfigEnv = Exclude<keyof NodeJS.ProcessEnv, number> | (string & {});

export type ConfigKeyLike<TKey extends string = string> = TKey | TKey[];

export type ConfigFormat =
  | 'string'
  | 'lowercase'
  | 'uppercase'
  | 'integer'
  | 'decimal'
  | 'port'
  | 'boolean';

export type ConfigParser<TOutput = unknown, TInput = unknown> =
  | Fn<TOutput, [TInput]>
  | ZodType<TOutput, TInput>;

export type ResolveConfigFormat<TFormat> = TFormat extends 'boolean'
  ? boolean
  : TFormat extends 'integer' | 'decimal' | 'port'
    ? number
    : string;

export type ResolveConfigParser<TParser = unknown> =
  TParser extends ZodType<infer TOutput>
    ? TOutput
    : TParser extends Fn<infer TOutput>
      ? TOutput
      : unknown;
