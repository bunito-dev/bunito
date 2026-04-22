import type { Class } from '@bunito/common';
import type { ClassDecorator } from '@bunito/container';
import { ClassOptions } from '@bunito/container';
import { CONTROLLER_COMPONENT } from '../constants';
import type { Middleware } from '../middleware';
import type { ControllerOptions } from '../types';

export function UseMiddleware(...middleware: Class<Middleware>[]): ClassDecorator {
  return ClassOptions<ControllerOptions>(CONTROLLER_COMPONENT, {
    middleware,
  });
}
