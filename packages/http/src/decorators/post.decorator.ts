import type { HTTPPath } from '../types';
import type { RouteDecorator, RouteDecoratorOptions } from './types';
import { createRouteDecorator } from './utils';

export function Post(
  path?: HTTPPath,
  options?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator;
export function Post(options?: RouteDecoratorOptions<'method'>): RouteDecorator;
export function Post(
  pathOrOptions?: HTTPPath | RouteDecoratorOptions,
  extraOptions?: RouteDecoratorOptions<'path'>,
): RouteDecorator {
  return createRouteDecorator(Post, 'POST', pathOrOptions, extraOptions);
}
