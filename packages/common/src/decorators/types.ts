import type { Any, Class, Fn } from '../helpers';

export type Decorator<TTarget, TContext extends DecoratorContext = DecoratorContext> = (
  target: TTarget,
  context: TContext,
) => TTarget;

export type ClassDecorator = Decorator<Class<Any>, ClassDecoratorContext>;

export type ClassMethodDecorator = Decorator<Fn<Any>, ClassMethodDecoratorContext>;
