import type { HTTPPath } from '../types';
import type { RouteDecorator, RouteDecoratorOptions } from './types';
import { createRouteDecorator } from './utils';

export function Delete(
  path?: HTTPPath,
  options?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator;
export function Delete(options?: RouteDecoratorOptions<'method'>): RouteDecorator;
export function Delete(
  pathOrOptions?: HTTPPath | RouteDecoratorOptions<'method'>,
  extraOptions?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator {
  return createRouteDecorator(Delete, 'DELETE', pathOrOptions, extraOptions);
}
