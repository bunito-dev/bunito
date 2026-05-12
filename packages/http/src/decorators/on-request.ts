import type { HTTPPath } from '../types';
import type { RouteDecorator, RouteDecoratorOptions } from './types';
import { createRouteDecorator } from './utils';

export function OnRequest(
  path?: HTTPPath,
  options?: RouteDecoratorOptions<'path'>,
): RouteDecorator;
export function OnRequest(options?: RouteDecoratorOptions): RouteDecorator;
export function OnRequest(
  pathOrOptions?: HTTPPath | RouteDecoratorOptions,
  extraOptions?: RouteDecoratorOptions<'path'>,
): RouteDecorator {
  return createRouteDecorator('ALL', pathOrOptions, extraOptions);
}
