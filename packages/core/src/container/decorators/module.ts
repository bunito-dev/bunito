import type { ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS, DEFAULT_SCOPES } from '../constants';
import type { ClassModuleOptions, ClassProviderMetadata, ModuleOptions } from '../types';

export function Module(options: ClassModuleOptions = {}): ClassDecorator {
  const {
    scope = DEFAULT_SCOPES.module,
    injects,
    providers = [],
    ...moduleOptions
  } = options;

  return createImmutableDecorator(({ metadata }, target) => {
    metadata[DECORATOR_METADATA_KEYS.module] = {
      ...moduleOptions,
      providers: [...providers, target],
    } satisfies ModuleOptions;
    metadata[DECORATOR_METADATA_KEYS.provider] = {
      scope,
      injects,
    } satisfies ClassProviderMetadata;
  });
}
