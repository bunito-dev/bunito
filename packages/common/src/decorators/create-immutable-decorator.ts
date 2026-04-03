import './polyfill';
import type { Class, Fn } from '../helpers';

export function createImmutableDecorator<
  TContext extends DecoratorContext = DecoratorContext,
>(
  contextHandler: (context: TContext, target: Class | Fn) => void,
): <TTarget extends Class | Fn>(target: TTarget, context: TContext) => TTarget {
  return (target, context) => {
    contextHandler(context, target);
    return target;
  };
}
