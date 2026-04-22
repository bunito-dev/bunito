import { DECORATOR_METADATA_KEYS } from './constants';
import type { ClassDecorator, ProviderDecoratorOptions, ProviderMetadata } from './types';

export function Provider(options: ProviderDecoratorOptions = {}): ClassDecorator {
  return (target, context) => {
    const { metadata } = context;

    metadata[DECORATOR_METADATA_KEYS.provider] ??= {};

    const providerMetadata = metadata[
      DECORATOR_METADATA_KEYS.provider
    ] as ProviderMetadata;

    if (providerMetadata.options !== undefined) {
      providerMetadata.options = {
        ...providerMetadata.options,
        ...options,
      };
    }

    providerMetadata.options = options;

    return target;
  };
}
