import type { Class } from '@bunito/common';
import { ConfigurationException } from '@bunito/common';
import { setClassOptionsDecoratorMetadata } from './metadata';
import type { ProviderDecoratorOptions } from './types';

export function Provider(
  options: ProviderDecoratorOptions = {},
): <TTarget extends Class>(target: TTarget, context: ClassDecoratorContext) => TTarget {
  return (target, context) => {
    if (
      !setClassOptionsDecoratorMetadata<ProviderDecoratorOptions>(
        Provider,
        context,
        options,
      )
    ) {
      return ConfigurationException.throw`@Provider() decorator is already defined on ${target}`;
    }

    return target;
  };
}
