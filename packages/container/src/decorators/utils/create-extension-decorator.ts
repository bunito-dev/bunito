import type { Fn } from '@bunito/common';
import type { ExtensionDecorator, ProviderDecoratorOptions } from '../types';
import { setProviderMetadataOptions } from './set-provider-metadata-options';

export function createExtensionDecorator<TExtension>(
  decorator: Fn,
  options: ProviderDecoratorOptions = {},
): ExtensionDecorator<TExtension> {
  return (target, context) => {
    setProviderMetadataOptions(decorator, context, options);
    return target;
  };
}
