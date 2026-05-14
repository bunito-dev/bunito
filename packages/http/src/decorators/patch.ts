import type { HTTPPath } from '../types';
import type { RouteDecorator, RouteDecoratorOptions } from './types';
import { createRouteDecorator } from './utils';

export function Patch(
  path?: HTTPPath,
  options?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator;
export function Patch(options?: RouteDecoratorOptions<'method'>): RouteDecorator;
export function Patch(
  pathOrOptions?: HTTPPath | RouteDecoratorOptions<'method'>,
  extraOptions?: RouteDecoratorOptions<'path' | 'method'>,
): RouteDecorator {
  return createRouteDecorator('PATCH', pathOrOptions, extraOptions);
}
