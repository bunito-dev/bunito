import type { Fn, Mandatory } from '@bunito/common';
import type { ProviderFactoryOptions } from '@bunito/container';
import type { ConfigService } from './config.service';

export type ConfigFactory<TConfig> = (
  configService: ConfigService,
) => Promise<TConfig> | TConfig;

export type ConfigFactoryOptions<TConfig> = Mandatory<
  ProviderFactoryOptions<ConfigFactory<TConfig>>,
  'token'
>;

export type ResolveConfig<TValue> =
  TValue extends ConfigFactoryOptions<infer TConfig> ? Awaited<TConfig> : TValue;

export type EnvKey = keyof NodeJS.ProcessEnv | (string & {});

export type EnvKeyLike = EnvKey | EnvKey[];

export type ValueParser<TOutput = string> =
  | Fn<TOutput | undefined, [string]>
  | {
      safeParse: (data: unknown) => { success: true; data: TOutput } | { success: false };
    };

export type ValueFormat = 'boolean' | 'port' | ValueNumberFormat | ValueStringFormat;

export type ValueNumberFormat = 'toDecimal' | 'toInteger';

export type ValueNumberOptions =
  | [min: number, max?: number]
  | [min: undefined, max: number];

export type ValueStringFormat = 'string' | 'toUpperCase' | 'toLowerCase';
