import type { Class } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from './constants';
import { Provider } from './provider.decorator';
import type {
  ClassDecorator,
  ComponentMetadata,
  ProviderDecoratorOptions,
} from './types';

export function Component<TTarget extends Class = Class, TOptions = unknown>(
  implName: string,
  key: symbol,
  options?: TOptions,
  providerOptions?: ProviderDecoratorOptions,
): ClassDecorator<TTarget> {
  return (target, context) => {
    const { metadata } = context;

    if (metadata[DECORATOR_METADATA_KEYS.component]) {
      ConfigurationException.throw`@${implName}() decorator already exists in ${target}`;
    }

    metadata[DECORATOR_METADATA_KEYS.component] = {
      key,
      options,
    } satisfies ComponentMetadata;

    if (providerOptions) {
      Provider(providerOptions)(target, context);
    }

    return target;
  };
}
