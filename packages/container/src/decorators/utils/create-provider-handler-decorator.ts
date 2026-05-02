import type { Fn } from '@bunito/common';
import { ContainerException } from '../../container.exception';
import { PROVIDER_METADATA_KEY } from '../constants';
import type {
  ProviderHandlerDecorator,
  ProviderHandlerDecoratorOptions,
  ProviderMetadata,
} from '../types';

export function createProviderHandlerDecorator(
  decorator: Fn,
  options: ProviderHandlerDecoratorOptions = {},
): ProviderHandlerDecorator {
  return (target, context) => {
    const { metadata, name: propKey } = context;

    metadata[PROVIDER_METADATA_KEY] ??= {};

    const providerMetadata = metadata[PROVIDER_METADATA_KEY] as ProviderMetadata;

    providerMetadata.handlers ??= new Map();

    if (providerMetadata.handlers.has(decorator)) {
      return ContainerException.throw`@${decorator}() decorator can only be applied once`;
    }

    providerMetadata.handlers.set(decorator, {
      ...options,
      propKey,
    });

    return target;
  };
}
