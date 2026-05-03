import type { HTTPPath } from '../types';
import type { RouteDecorator, RouteDecoratorOptions } from './types';
import { createRouteDecorator } from './utils';

export function Route(
  path?: HTTPPath,
  options?: RouteDecoratorOptions<'path'>,
): RouteDecorator;
export function Route(options?: RouteDecoratorOptions): RouteDecorator;
export function Route(
  pathOrOptions?: HTTPPath | RouteDecoratorOptions,
  extraOptions?: RouteDecoratorOptions<'path'>,
): RouteDecorator {
  return createRouteDecorator(Route, undefined, pathOrOptions, extraOptions);
}
