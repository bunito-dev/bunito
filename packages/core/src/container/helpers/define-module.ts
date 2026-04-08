import type { Mandatory } from '@bunito/common';
import type { ModuleOptions } from '../types';

export function defineModule(
  name: `${string}Module`,
  options: Omit<ModuleOptions, 'token'>,
): Mandatory<ModuleOptions, 'token'> {
  return {
    token: Symbol(name),
    ...options,
  };
}
