import type { Fn, MaybePromise, Optional } from '@bunito/common';
import type {
  ClassMethodDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import type { ControllerOptions, RouteOptions } from '../types';

export type RouteDecorator = ClassMethodDecorator<Fn<MaybePromise>>;

export type RouteDecoratorOptions<TOmit extends keyof RouteOptions = never> = Optional<
  RouteOptions,
  TOmit
>;

export type ControllerDecoratorOptions = ControllerOptions & ProviderDecoratorOptions;
