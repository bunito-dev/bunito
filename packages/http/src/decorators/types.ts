import type { Fn, MaybePromise, Optional } from '@bunito/common';
import type { ClassMethodDecorator } from '@bunito/container/internals';
import type { RouteOptions } from '../types';

export type RouteDecorator = ClassMethodDecorator<Fn<MaybePromise>>;

export type RouteDecoratorOptions<TOmit extends keyof RouteOptions = never> = Omit<
  Optional<RouteOptions, 'method'>,
  TOmit
>;
