import type { RawObject } from '@bunito/common';
import {
  assignNonNullish,
  InternalException,
  isFn,
  isObject,
  isString,
} from '@bunito/common';
import { ConfigService } from '../config-service';
import type { ConfigBuilder, ConfigProvider } from '../types';

export function defineConfig<TConfig extends RawObject>(
  builder: ConfigBuilder<Partial<TConfig>>,
  config: TConfig,
): ConfigProvider<TConfig>;
export function defineConfig<TConfig extends RawObject>(
  builder: ConfigBuilder<TConfig>,
): ConfigProvider<TConfig>;
export function defineConfig<TConfig extends RawObject>(
  name: string,
  builder: ConfigBuilder<Partial<TConfig>>,
  config: TConfig,
): ConfigProvider<TConfig>;
export function defineConfig<TConfig extends RawObject>(
  name: string,
  configOrBuilder: TConfig | ConfigBuilder<TConfig>,
): ConfigProvider<TConfig>;
export function defineConfig<TConfig extends RawObject>(
  ...args: unknown[]
): ConfigProvider<TConfig> {
  let name: string | undefined;
  let config: TConfig | undefined;
  let builder: ConfigBuilder<TConfig> | undefined;

  for (const arg of args) {
    if (isString(arg, false)) {
      name = arg;
      continue;
    }

    if (isObject(arg)) {
      config = arg as TConfig;
      continue;
    }

    if (isFn(arg)) {
      if (!name) {
        name = arg.name;
      }
      builder = arg as ConfigBuilder<TConfig>;
    }
  }

  if (!name) {
    return InternalException.throw`Unnamed config detected`;
  }

  const token = Symbol(`config(${name})`);

  if (!builder) {
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

      try {
        return assignNonNullish(
          {
            ...(config ?? {}),
          } as TConfig,
          await builder.call(configService, configService),
        );
      } catch (err) {
        if (InternalException.isInstance(err)) {
          throw err.setContext(name);
        }

        throw new InternalException('Failed to build config', err).setContext(name);
      }
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
