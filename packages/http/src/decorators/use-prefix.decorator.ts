import type { ClassDecorator } from '@bunito/container';
import { ClassOptions } from '@bunito/container';
import type { HttpPath } from '@bunito/server';
import { CONTROLLER_COMPONENT } from '../constants';
import type { ControllerOptions } from '../types';

export function UsePrefix(prefix: HttpPath): ClassDecorator {
  return ClassOptions<ControllerOptions>(CONTROLLER_COMPONENT, {
    prefix,
  });
}
