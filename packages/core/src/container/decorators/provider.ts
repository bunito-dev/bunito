import type { Class, ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { CONTAINER_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata } from '../types';

export function Provider<TProvider extends Class>(
  options: ClassProviderMetadata = {},
): ClassDecorator<TProvider> {
  return createImmutableDecorator(({ metadata }) => {
    metadata[CONTAINER_METADATA_KEYS.PROVIDER] = options;
  });
}
