import type { Class } from '@bunito/common';
import type { ClassDecorator } from '@bunito/container/internals';
import { createComponentDecorator } from '@bunito/container/internals';
import type { Middleware, ResolveMiddlewareOptions } from '../middleware';
import type { ControllerClassOptions } from '../types';
import { Controller } from './controller.decorator';

export function UseMiddleware<TMiddleware extends Class<Middleware>>(
  middleware: TMiddleware,
  options?: ResolveMiddlewareOptions<TMiddleware>,
): ClassDecorator {
  return createComponentDecorator<ClassDecorator, ControllerClassOptions>(
    Controller,
    { kind: 'middleware', middleware, options: options ?? {} },
    UseMiddleware,
  );
}
