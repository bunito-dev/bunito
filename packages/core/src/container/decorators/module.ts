import type { Class, ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { CONTAINER_METADATA_KEYS, DEFAULT_SCOPES } from '../constants';
import type { ClassModuleOptions, ClassProviderMetadata, ModuleOptions } from '../types';

export function Module<TModule extends Class>(
  options: ClassModuleOptions = {},
): ClassDecorator<TModule> {
  const {
    scope = DEFAULT_SCOPES.MODULE,
    injects,
    providers = [],
    ...moduleOptions
  } = options;

  return createImmutableDecorator(({ metadata }, target) => {
    metadata[CONTAINER_METADATA_KEYS.MODULE] = {
      ...moduleOptions,
      providers: [...providers, target],
    } satisfies ModuleOptions;
    metadata[CONTAINER_METADATA_KEYS.PROVIDER] = {
      scope,
      injects,
    } satisfies ClassProviderMetadata;
  });
}
