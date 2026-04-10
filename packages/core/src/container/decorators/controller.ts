import type { Class, ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { CONTAINER_METADATA_KEYS, DEFAULT_SCOPES } from '../constants';
import type { ClassProviderMetadata, ControllerOptions } from '../types';

export function Controller<TController extends Class>(
  options: ControllerOptions = {},
): ClassDecorator<TController> {
  const { scope = DEFAULT_SCOPES.CONTROLLER, injects } = options;

  return createImmutableDecorator(({ metadata }) => {
    metadata[CONTAINER_METADATA_KEYS.CONTROLLER] = true;
    metadata[CONTAINER_METADATA_KEYS.PROVIDER] = {
      scope,
      injects,
    } satisfies ClassProviderMetadata;
  });
}
