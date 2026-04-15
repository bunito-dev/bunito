import { ConfigService } from '../config.service';
import type { ConfigFactory, ConfigFactoryOptions } from '../types';

export function defineConfig<TConfig>(
  name: string,
  factory: ConfigFactory<TConfig>,
): ConfigFactoryOptions<TConfig> {
  return {
    token: Symbol(`config(${name})`),
    useFactory: factory,
    scope: 'singleton',
    injects: [ConfigService],
  };
}
