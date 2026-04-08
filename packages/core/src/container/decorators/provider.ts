import type { Class, ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata } from '../types';

export function Provider<TProvider extends Class>(
  options: ClassProviderMetadata = {},
): ClassDecorator<TProvider> {
  return createImmutableDecorator(({ metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.PROVIDER] = options;
  });
}
