import type { Class, ClassDecorator } from '@bunito/common';
import { createComponentOptionsDecorator } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import type { ControllerOptions, HttpPath } from '../types';

export function UsePath<TTarget extends Class>(path: HttpPath): ClassDecorator<TTarget> {
  return createComponentOptionsDecorator<ControllerOptions, TTarget>(HTTP_CONTROLLER, {
    kind: 'path',
    path,
  });
}
