import type { Class } from '@bunito/common';
import { setDecoratorMetadata } from '@bunito/common';
import { PROVIDER_METADATA_KEY } from '../constants';
import type { ClassProviderOptions } from '../types';

export type ProviderDecoratorOptions = Omit<ClassProviderOptions, 'useClass'>;

export function Provider(
  options: ProviderDecoratorOptions = {},
): <TTarget extends Class>(target: TTarget, context: ClassDecoratorContext) => TTarget {
  return (target, context) => {
    setDecoratorMetadata<ClassProviderOptions>(context, PROVIDER_METADATA_KEY, {
      ...options,
      useClass: target,
    });

    return target;
  };
}
