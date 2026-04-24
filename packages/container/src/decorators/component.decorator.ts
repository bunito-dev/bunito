import type { Class } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from './constants';
import { Provider } from './provider.decorator';
import type { ClassDecorator, ProviderDecoratorOptions } from './types';

export function Component<TTarget extends Class = Class, TOptions = unknown>(
  implName: string,
  key: symbol,
  options?: TOptions,
  providerOptions?: ProviderDecoratorOptions,
): ClassDecorator<TTarget> {
  return (target, context) => {
    context.metadata[DECORATOR_METADATA_KEYS.components] ??= new Map();

    const metadata = context.metadata[DECORATOR_METADATA_KEYS.components] as Map<
      symbol,
      TOptions | undefined
    >;

    if (metadata.has(key)) {
      ConfigurationException.throw`@${implName}() decorator already exists in ${target}`;
    }

    metadata.set(key, options);

    if (providerOptions) {
      Provider(providerOptions)(target, context);
    }

    return target;
  };
}
