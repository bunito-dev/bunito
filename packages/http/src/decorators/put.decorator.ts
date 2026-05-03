import type { HTTPPath } from '../types';
import type { RouteDecorator, RouteDecoratorOptions } from './types';
import { createRouteDecorator } from './utils';

export function Put(
  path?: HTTPPath,
  options?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator;
export function Put(options?: RouteDecoratorOptions<'method'>): RouteDecorator;
export function Put(
  pathOrOptions?: HTTPPath | RouteDecoratorOptions,
  extraOptions?: RouteDecoratorOptions<'path'>,
): RouteDecorator {
  return createRouteDecorator(Put, 'PUT', pathOrOptions, extraOptions);
}
