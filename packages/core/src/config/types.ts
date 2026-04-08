import type { Fn } from '@bunito/common';
import type { FactoryProviderOptions } from '../container';

export type ResolveConfig<TValue> =
  TValue extends FactoryProviderOptions<infer TConfig> ? Awaited<TConfig> : TValue;

export type ConfigEnvKey = keyof NodeJS.ProcessEnv | (string & {});
export type ConfigEnvKeysLike = ConfigEnvKey | ConfigEnvKey[];

export type ConfigValueParser<TOutput = string> =
  | Fn<TOutput | undefined, [string]>
  | {
      safeParse: (data: unknown) => { success: true; data: TOutput } | { success: false };
    };

export type ConfigValueFormat =
  | 'boolean'
  | 'port'
  | ConfigValueNumberFormat
  | ConfigValueStringFormat;

export type ConfigValueNumberFormat = 'toDecimal' | 'toInteger';

export type ConfigValueNumberOptions =
  | [min: number, max?: number]
  | [min: undefined, max: number];

export type ConfigValueStringFormat = 'string' | 'toUpperCase' | 'toLowerCase';
