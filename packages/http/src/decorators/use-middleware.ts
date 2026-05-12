import type { Class } from '@bunito/common';
import type { ClassDecorator } from '@bunito/container/internals';
import { createClassPropDecorator } from '@bunito/container/internals';
import { HTTP_CONTROLLER_KEY } from '../constants';
import type { Middleware, ResolveMiddlewareOptions } from '../middleware';
import type { ControllerClassOptions } from '../types';

export function UseMiddleware<TMiddleware extends Class<Middleware>>(
  middleware: TMiddleware,
  options?: ResolveMiddlewareOptions<TMiddleware>,
): ClassDecorator {
  return createClassPropDecorator<ControllerClassOptions, ClassDecorator>(
    HTTP_CONTROLLER_KEY,
    { kind: 'middleware', middleware, options: options ?? {} },
  );
}
