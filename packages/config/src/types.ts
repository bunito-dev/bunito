import type { Fn, Mandatory, MaybePromise } from '@bunito/common';
import type {
  ProviderFactoryOptions,
  ProviderValueOptions,
} from '@bunito/container/internals';
import type { ConfigService } from './config.service';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      CI?: string;
      TZ?: string;
    }
  }

  namespace Bunito {
    interface ModuleOptionalProviders {
      configs: ConfigProviderOptions<unknown>[];
    }
  }
}

export type ConfigFactory<TConfig> = (
  configService: ConfigService,
) => MaybePromise<TConfig>;

export type ConfigProviderOptions<TConfig> =
  | Mandatory<ProviderFactoryOptions<Fn<MaybePromise<TConfig | undefined>>>, 'token'>
  | Mandatory<ProviderValueOptions<TConfig | undefined>, 'token'>;

export type ResolveConfig<TValue> =
  TValue extends ConfigProviderOptions<infer TConfig> ? Awaited<TConfig> : TValue;

export type EnvKey = keyof NodeJS.ProcessEnv | (string & {});

export type EnvKeyLike = EnvKey | EnvKey[];

export type SecretKeyLike = string | string[];

export type ValueParser<TOutput = string> =
  | Fn<TOutput | undefined, [unknown]>
  | {
      safeParse: (data: unknown) => { success: true; data: TOutput } | { success: false };
    };

export type ValueFormat = 'boolean' | 'port' | ValueNumberFormat | ValueStringFormat;

export type ValueNumberFormat = 'toDecimal' | 'toInteger';

export type ValueNumberOptions =
  | [min: number, max?: number]
  | [min: undefined, max: number];

export type ValueStringFormat = 'string' | 'toUpperCase' | 'toLowerCase';
