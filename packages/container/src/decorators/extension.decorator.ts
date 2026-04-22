import type { Class } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from './constants';
import { Provider } from './provider.decorator';
import type {
  ClassDecorator,
  ExtensionMetadata,
  ProviderDecoratorOptions,
} from './types';

export function Extension<TTarget extends Class = Class, TOptions = unknown>(
  implName: string,
  key: symbol,
  options?: TOptions,
  providerOptions: ProviderDecoratorOptions = {},
): ClassDecorator<TTarget> {
  return (target, context) => {
    const { metadata } = context;

    if (metadata[DECORATOR_METADATA_KEYS.extension]) {
      ConfigurationException.throw`@${implName}() decorator already exists in ${target}`;
    }

    metadata[DECORATOR_METADATA_KEYS.extension] = {
      key,
      options,
    } satisfies ExtensionMetadata;

    Provider(providerOptions)(target, context);

    return target;
  };
}
