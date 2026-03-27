import type { Mandatory } from '@bunito/common';
import type { FactoryProviderOptions } from '../../container';
import { ConfigService } from '../config-service';

export function registerConfig<TConfig>(
  name: string,
  factory: (configService: ConfigService) => Promise<TConfig> | TConfig,
): Mandatory<FactoryProviderOptions<Promise<TConfig> | TConfig>, 'token'> {
  return {
    token: Symbol(`config(${name})`),
    useFactory: factory,
    scope: 'module',
    injects: [ConfigService],
  };
}
