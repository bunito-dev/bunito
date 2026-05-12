import type { Fn } from '@bunito/common';
import { InternalException } from '@bunito/common';
import { CLASS_METADATA_KEYS } from '../constants';
import type { ProviderDecoratorOptions, ProviderMetadata } from '../types';

export function setProviderMetadataOptions(
  decorator: Fn,
  context: ClassDecoratorContext,
  options?: ProviderDecoratorOptions,
): void {
  context.metadata[CLASS_METADATA_KEYS.provider] ??= {};

  const metadata = context.metadata[CLASS_METADATA_KEYS.provider] as ProviderMetadata;

  if (metadata.decorator) {
    if (metadata.decorator !== decorator) {
      InternalException.throw`@${decorator}() decorator conflicts with @${metadata.decorator}() decorator`;
    } else {
      InternalException.throw`@${decorator}() decorator can only be applied once`;
    }
    return;
  }

  metadata.decorator = decorator;
  metadata.options = options;
}
