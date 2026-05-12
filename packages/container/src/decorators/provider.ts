import type { ClassDecorator, ProviderDecoratorOptions } from './types';
import { setProviderMetadataOptions } from './utils';

export function Provider(options: ProviderDecoratorOptions = {}): ClassDecorator {
  return (target, context) => {
    setProviderMetadataOptions(Provider, context, options);
    return target;
  };
}
