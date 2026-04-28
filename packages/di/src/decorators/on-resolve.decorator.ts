import type { Fn, MaybePromise } from '@bunito/common';
import type { ProviderHandlerSchema } from '../types';
import { setClassHandlerDecoratorMetadata } from './metadata';
import { Provider } from './provider.decorator';
import type { ProviderHandlerDecoratorOptions } from './types';

export function OnResolve(
  options: ProviderHandlerDecoratorOptions = {},
): <TTarget extends Fn<MaybePromise<void>>>(
  target: TTarget,
  context: ClassMethodDecoratorContext,
) => TTarget {
  return (target, context) => {
    setClassHandlerDecoratorMetadata<ProviderHandlerSchema>(
      Provider,
      OnResolve,
      context,
      options,
    );
    return target;
  };
}
