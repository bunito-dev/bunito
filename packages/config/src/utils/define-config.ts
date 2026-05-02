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
      useValue: config as TConfig,
    };
  }

  return {
    token,
    useFactory: async (configService: ConfigService | undefined) => {
      if (!configService) {
        return config as TConfig;
      }

      const result = (await factory(configService.createHelper(name))) as RawObject;

      if (config) {
        for (const [key, value] of Object.entries(result)) {
          if (value === undefined) {
            result[key] = config[key];
          }
        }
      }

      return result as TConfig;
    },
    scope: 'singleton',
    injects: [
      {
        useToken: ConfigService,
        optional: true,
      },
    ],
  };
}
