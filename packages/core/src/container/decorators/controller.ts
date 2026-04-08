import type { Class, ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS, DEFAULT_SCOPES } from '../constants';
import type { ClassProviderMetadata, ControllerOptions } from '../types';

export function Controller<TController extends Class>(
  options: ControllerOptions = {},
): ClassDecorator<TController> {
  const { scope = DEFAULT_SCOPES.CONTROLLER, injects } = options;

  return createImmutableDecorator(({ metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.CONTROLLER] = true;
    metadata[DECORATOR_METADATA_KEYS.PROVIDER] = {
      scope,
      injects,
    } satisfies ClassProviderMetadata;
  });
}
