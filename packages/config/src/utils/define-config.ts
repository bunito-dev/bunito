import type { RawObject } from '@bunito/common';
import { isFn, isObject } from '@bunito/common';
import { ConfigService } from '../config.service';
import type { ConfigFactory, ConfigProviderOptions } from '../types';

export function defineConfig<TConfig extends RawObject>(
  name: string,
  config: TConfig,
  factory?: ConfigFactory<Partial<TConfig>>,
): ConfigProviderOptions<TConfig>;
export function defineConfig<TConfig extends RawObject>(
  name: string,
  factory: ConfigFactory<TConfig>,
): ConfigProviderOptions<TConfig>;
export function defineConfig<TConfig extends RawObject>(
  name: string,
  configOrFactory: ConfigFactory<TConfig> | TConfig,
  optionalFactory?: ConfigFactory<Partial<TConfig>>,
): ConfigProviderOptions<TConfig> {
  const token = Symbol(`config(${name})`);

  let config: TConfig | undefined;
  let factory: ConfigFactory<Partial<TConfig>> | undefined;

  if (isObject(configOrFactory)) {
    config = configOrFactory as TConfig;
    if (isFn(optionalFactory)) {
      factory = optionalFactory;
    }
  } else if (isFn(configOrFactory)) {
    factory = configOrFactory;
  }

  if (!factory) {
    return {
      token,
      useValue: config,
    };
  }

  return {
    token,
    useFactory: async (configService: ConfigService | undefined) => {
      if (!configService) {
        return config;
      }

      const result = (await factory(configService)) as RawObject;

      if (config) {
        for (const [key, value] of Object.entries(result)) {
          if (value === undefined) {
            result[key] = config[key];
          }
        }
      }

      return result as TConfig | undefined;
    },
    scope: 'singleton',
    injects: [
      {
        token: ConfigService,
        optional: true,
      },
    ],
  };
}
