import type { Class, Fn, MaybePromise, Optional } from '@bunito/common';
import type { ClassMethodDecorator } from '@bunito/container';
import type { RouteOptions } from '../types';

export type RouteDecorator = ClassMethodDecorator<Fn<MaybePromise>>;

export type RouteDecoratorOptions<TOmit extends keyof RouteOptions = never> = Omit<
  Optional<RouteOptions, 'method'>,
  TOmit
>;

export type HeadersDecorator = <TTarget extends Class | Fn<MaybePromise>>(
  target: TTarget,
  context: ClassDecoratorContext | ClassMemberDecoratorContext,
) => TTarget;
