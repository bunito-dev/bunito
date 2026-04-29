import { setClassDecoratorMetadata } from '../metadata';
import type { ClassDecorator, ProviderDecoratorOptions } from './types';

export function Provider(options: ProviderDecoratorOptions = {}): ClassDecorator {
  return (target, context) => {
    setClassDecoratorMetadata<ProviderDecoratorOptions>(
      Provider,
      'options',
      context,
      options,
    );

    return target;
  };
}
