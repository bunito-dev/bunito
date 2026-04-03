import type { ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata } from '../types';

export function Provider(options: ClassProviderMetadata = {}): ClassDecorator {
  return createImmutableDecorator(({ metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.provider] = options;
  });
}
