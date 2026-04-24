import type { Class } from '@bunito/common';
import type {
  ClassDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { Extension } from '@bunito/container/internals';
import { CONFIG_EXTENSION } from './constants';

export interface ConfigExtension {
  getSecret(key: string): Promise<unknown>;
}

export function ConfigExtension(
  options: ProviderDecoratorOptions<'scope' | 'global' | 'token'> = {},
): ClassDecorator<Class<ConfigExtension>> {
  return Extension('ConfigExtension', CONFIG_EXTENSION, undefined, {
    scope: 'singleton',
    ...options,
  });
}
