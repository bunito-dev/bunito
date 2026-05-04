import type { HTTPPath } from '../types';
import type { RouteDecorator, RouteDecoratorOptions } from './types';
import { createRouteDecorator } from './utils';

export function Get(
  path?: HTTPPath,
  options?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator;
export function Get(options?: RouteDecoratorOptions<'method'>): RouteDecorator;
export function Get(
  pathOrOptions?: HTTPPath | RouteDecoratorOptions<'method'>,
  extraOptions?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator {
  return createRouteDecorator(Get, 'GET', pathOrOptions, extraOptions);
}
