import type { Any, Class, Fn } from '../helpers';

export type Decorator<
  TTarget extends Class | Fn,
  TContext extends DecoratorContext = DecoratorContext,
> = (target: TTarget, context: TContext) => TTarget;

export type ClassDecorator<TTarget extends Class = Class<Any>> = Decorator<
  TTarget,
  ClassDecoratorContext
>;

export type ClassMethodDecorator<TTarget extends Fn = Fn<Any>> = Decorator<
  TTarget,
  ClassMethodDecoratorContext
>;
