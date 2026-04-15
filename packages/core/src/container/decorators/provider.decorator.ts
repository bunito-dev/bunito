import type { Class, ClassDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ProviderDecoratorOptions } from '../types';

export function Provider<TProvider extends Class>(
  options?: ProviderDecoratorOptions,
): ClassDecorator<TProvider> {
  return (target, { metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS] = options ?? {};

    return target;
  };
}
