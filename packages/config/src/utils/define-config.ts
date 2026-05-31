import type { RawObject } from '@bunito/common';
import { InternalException, isFn, isString, warn } from '@bunito/common';
import { ConfigService } from '../config.service';
import type { ConfigBuilder, ConfigContext, ConfigProvider } from '../types';

export function defineConfig<TConfig extends RawObject>(
  builder: ConfigBuilder<TConfig>,
): ConfigProvider<TConfig>;
export function defineConfig<TConfig extends RawObject>(
  name: string,
  config: TConfig,
): ConfigProvider<TConfig>;
export function defineConfig(
  nameOrBuilder: string | ConfigBuilder<RawObject>,
  config: RawObject = {},
): ConfigProvider<RawObject> {
  let name: string | undefined;
  let builder: ConfigBuilder<RawObject> | undefined;

  if (isString(nameOrBuilder, false)) {
    name = nameOrBuilder;
  } else if (isFn(nameOrBuilder)) {
    name = nameOrBuilder.name;
    builder = nameOrBuilder;
  }

  if (!name) {
    throw new InternalException('Unnamed config');
  }

  const token = `config(${name})`;

  if (builder) {
    return {
      token,
      useFactory: async (configService?: ConfigContext) => {
        if (!configService) {
          warn(
            `ConfigService is not available in the ${token} context`,
            'using default config values',
            'import ConfigModule from @bunito/bunito for envs / secret support',
          );
        }

        const context = configService ?? {};

        try {
          return await builder.call(context, context);
        } catch (err) {
          const exception = InternalException.isInstance(err)
            ? err
            : new InternalException('Failed to build config', err);

          throw exception.setContext(token);
        }
      },
      scope: 'singleton',
      injects: [
        {
          useToken: ConfigService,
          defaultValue: {},
        },
      ],
    };
  }

  return {
    token,
    useValue: config,
  };
}
