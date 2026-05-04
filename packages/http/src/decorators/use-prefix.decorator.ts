import type { ClassDecorator } from '@bunito/container/internals';
import { createComponentDecorator } from '@bunito/container/internals';
import type { ControllerClassOptions, HTTPPath } from '../types';
import { Controller } from './controller.decorator';

export function UsePrefix(prefix: HTTPPath): ClassDecorator {
  return createComponentDecorator<ClassDecorator, ControllerClassOptions>(
    Controller,
    { kind: 'prefix', prefix },
    UsePrefix,
  );
}
