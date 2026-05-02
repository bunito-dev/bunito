import type { Fn } from '@bunito/common';
import { ContainerException } from '../../container.exception';
import { MODULE_METADATA_KEY, PROVIDER_METADATA_KEY } from '../constants';
import type {
  ExtensionDecorator,
  ProviderDecoratorOptions,
  ProviderMetadata,
} from '../types';

export function createExtensionDecorator<TExtension>(
  decorator: Fn,
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<TExtension> {
  return (target, context) => {
    const { metadata } = context;

    if (metadata[MODULE_METADATA_KEY]) {
      return ContainerException.throw`@${decorator}() decorator conflicts with @Module() decorator`;
    }

    metadata[PROVIDER_METADATA_KEY] ??= {};

    const providerMetadata = metadata[PROVIDER_METADATA_KEY] as ProviderMetadata;

    if (providerMetadata.options) {
      if (!providerMetadata.decorator) {
        return ContainerException.throw`@${decorator}() decorator conflicts with @Provider() decorator`;
      }

      if (providerMetadata.decorator !== decorator) {
        return ContainerException.throw`@${decorator}() decorator conflicts with @${providerMetadata.decorator}() decorator`;
      }

      return ContainerException.throw`@${decorator}() decorator can only be applied once`;
    }

    providerMetadata.decorator = decorator;
    providerMetadata.options = options;

    return target;
  };
}
