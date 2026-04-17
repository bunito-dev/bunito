import type { Class, Fn } from '../helpers';

export type Decorator<TTarget, TContext extends DecoratorContext = DecoratorContext> = (
  target: TTarget,
  context: TContext,
) => TTarget;

export type ClassDecorator<TTarget extends Class = Class> = Decorator<
  TTarget,
  ClassDecoratorContext
>;

export type ClassFieldDecorator<TTarget> = Decorator<TTarget, ClassFieldDecoratorContext>;

export type ClassMethodDecorator<TTarget extends Fn = Fn> = Decorator<
  TTarget,
  ClassMethodDecoratorContext
>;
