import type { Fn, MaybePromise } from '@bunito/common';
import { setClassDecoratorMetadata } from '../metadata';
import type { ProviderHandlerSchema } from '../types';
import type { ClassMethodDecorator, ProviderHandlerDecoratorOptions } from './types';

export function OnResolve(
  options: ProviderHandlerDecoratorOptions = {},
): ClassMethodDecorator<Fn<MaybePromise<void>>> {
  return (target, context) => {
    setClassDecoratorMetadata<ProviderHandlerSchema>(
      OnResolve,
      'handler',
      context,
      options,
    );

    return target;
  };
}
