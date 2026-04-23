import type { Any, Class } from '@bunito/common';
import type { ClassDecorator } from '@bunito/container/internals';
import { ClassOptions } from '@bunito/container/internals';
import { CONTROLLER_COMPONENT } from '../constants';
import type { Middleware, ResolveMiddlewareOptions } from '../middleware';
import type { ControllerOptions } from '../types';

export function UseMiddleware<TMiddleware extends Middleware<Any>>(
  middleware: Class<TMiddleware>,
  options?: ResolveMiddlewareOptions<TMiddleware>,
): ClassDecorator {
  return ClassOptions<ControllerOptions>(CONTROLLER_COMPONENT, {
    kind: 'middleware',
    middleware,
    options,
  });
}
