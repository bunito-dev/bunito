import type { Fn, MaybePromise } from '@bunito/common';
import { setClassDecoratorMetadata } from '../metadata';
import type { ProviderHandlerSchema } from '../types';
import type { ClassMethodDecorator, ProviderHandlerDecoratorOptions } from './types';

export function OnInit(
  options: ProviderHandlerDecoratorOptions = {},
): ClassMethodDecorator<Fn<MaybePromise<void>>> {
  return (target, context) => {
    setClassDecoratorMetadata<ProviderHandlerSchema>(OnInit, 'handler', context, {
      ...options,
      disposable: true,
    });

    return target;
  };
}
