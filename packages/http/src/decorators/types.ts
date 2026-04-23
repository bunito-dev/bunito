import type {
  ClassMethodDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import type { HttpPath } from '@bunito/server';
import type { RouteOptions } from '../types';

export type ControllerDecoratorOptions = {
  prefix?: HttpPath;
} & ProviderDecoratorOptions<'token' | 'global'>;

export interface RouteDecorator<TOmit extends keyof RouteOptions = never> {
  (path?: HttpPath, options?: Omit<RouteOptions, 'path' | TOmit>): ClassMethodDecorator;
  (options: Omit<RouteOptions, TOmit>): ClassMethodDecorator;
}
