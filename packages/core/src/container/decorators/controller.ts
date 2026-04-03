import type { ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS, DEFAULT_SCOPES } from '../constants';
import type { ClassProviderMetadata, ControllerOptions } from '../types';

export function Controller(options: ControllerOptions = {}): ClassDecorator {
  const { scope = DEFAULT_SCOPES.controller, injects } = options;

  return createImmutableDecorator(({ metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.controller] = true;
    metadata[DECORATOR_METADATA_KEYS.provider] = {
      scope,
      injects,
    } satisfies ClassProviderMetadata;
  });
}
