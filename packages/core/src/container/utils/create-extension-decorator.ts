import type { Class, ClassDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ExtensionKey, ProviderDecoratorOptions } from '../types';

export function createExtensionDecorator<
  TOptions = unknown,
  TExtension extends Class = Class,
>(
  extensionKey: ExtensionKey,
  options?: TOptions,
  providerOptions?: ProviderDecoratorOptions,
): ClassDecorator<TExtension> {
  return (target, { metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.EXTENSION_KEY] = extensionKey;

    if (options) {
      metadata[DECORATOR_METADATA_KEYS.EXTENSION_OPTIONS] = options;
    }

    if (providerOptions) {
      metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS] = providerOptions;
    }

    return target;
  };
}
