import type { Mandatory, MaybePromise } from '@bunito/common';
import type {
  ProviderFactoryOptions,
  ProviderValueOptions,
} from '@bunito/container/internals';
import type { ConfigService } from './config.service';
import type { ConfigHelper } from './helper';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'production' | 'test' | 'development' | 'ci' | (string & {});
      CI?: 'true' | (string & {});
      TZ?: string;
    }
  }

  namespace Bunito {
    interface ModuleProviders {
      configs: ConfigProviderOptions<unknown>[];
    }
  }
}

export type ConfigFactory<TConfig> = (
  configHelper: ConfigHelper,
) => MaybePromise<TConfig>;

export type ConfigProviderOptions<TConfig> =
  | Mandatory<
      ProviderFactoryOptions<Promise<TConfig>, [configService?: ConfigService]>,
      'token'
    >
  | ProviderValueOptions<TConfig>;

export type ResolveConfig<TValue> =
  TValue extends ConfigProviderOptions<infer TConfig> ? Awaited<TConfig> : TValue;

export type ConfigFlag = 'ci' | 'prod' | 'dev' | 'test';

export type ConfigEnvKey = Exclude<keyof NodeJS.ProcessEnv, number> | (string & {});
