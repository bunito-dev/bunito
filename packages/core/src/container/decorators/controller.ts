import type { Class } from '@bunito/common';
import type { ClassProviderOptions } from '../types';
import { Provider } from './provider';

export type ControllerDecoratorOptions = Pick<ClassProviderOptions, 'injects'>;

export function Controller(
  options: ControllerDecoratorOptions = {},
): <TTarget extends Class>(target: TTarget, context: ClassDecoratorContext) => TTarget {
  const { injects } = options;

  return (target, context) => {
    return Provider({
      scope: 'request',
      injects,
    })(target, context);
  };
}
