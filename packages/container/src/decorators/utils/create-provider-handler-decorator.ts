import type { Fn } from '@bunito/common';
import { InternalException } from '@bunito/common';
import { CLASS_METADATA_KEYS } from '../constants';
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
    context.metadata[CLASS_METADATA_KEYS.provider] ??= {};

    const metadata = context.metadata[CLASS_METADATA_KEYS.provider] as ProviderMetadata;

    metadata.handlers ??= new Map();

    if (metadata.handlers.has(decorator)) {
      return InternalException.throw`@${decorator}() decorator can only be applied once`;
    }

    metadata.handlers.set(decorator, {
      propKey: context.name,
      ...options,
    });

    return target;
  };
}
