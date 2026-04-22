import type { ClassMethodDecorator, ProviderDecoratorOptions } from '@bunito/container';
import type { HttpPath } from '@bunito/server';
import type { ControllerOptions, RouteOptions } from '../types';

export type ControllerDecoratorOptions = ControllerOptions &
  ProviderDecoratorOptions<'token' | 'global'>;

export interface RouteDecorator<TOmit extends keyof RouteOptions = never> {
  (path?: HttpPath, options?: Omit<RouteOptions, 'path' | TOmit>): ClassMethodDecorator;
  (options: Omit<RouteOptions, TOmit>): ClassMethodDecorator;
}
