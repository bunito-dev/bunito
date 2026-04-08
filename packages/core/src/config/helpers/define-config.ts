import type { Mandatory } from '@bunito/common';
import type { FactoryProviderOptions } from '../../container';
import { ConfigService } from '../config-service';

export function defineConfig<TConfig>(
  name: `${string}Config`,
  factory: (configService: ConfigService) => Promise<TConfig> | TConfig,
): Mandatory<FactoryProviderOptions<Promise<TConfig> | TConfig>, 'token'> {
  return {
    token: Symbol(name),
    useFactory: factory,
    scope: 'singleton',
    injects: [ConfigService],
  };
}
