import { ContainerException } from '../container.exception';
import { MODULE_METADATA_KEY, PROVIDER_METADATA_KEY } from './constants';
import type { ClassDecorator, ProviderDecoratorOptions, ProviderMetadata } from './types';

export function Provider(options: ProviderDecoratorOptions = {}): ClassDecorator {
  return (target, context) => {
    const { metadata } = context;

    if (metadata[MODULE_METADATA_KEY]) {
      return ContainerException.throw`@Provider() decorator conflicts with @Module() decorator`;
    }

    metadata[PROVIDER_METADATA_KEY] ??= {};

    const providerMetadata = metadata[PROVIDER_METADATA_KEY] as ProviderMetadata;

    if (providerMetadata.options) {
      if (providerMetadata.decorator) {
        return ContainerException.throw`@Provider() decorator conflicts with @${providerMetadata.decorator}() decorator`;
      }

      return ContainerException.throw`@Provider() decorator can only be applied once`;
    }

    providerMetadata.options = options;

    return target;
  };
}
