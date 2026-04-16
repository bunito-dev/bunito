import type { Class, ClassDecorator } from '@bunito/common';
import { createComponentOptionsDecorator } from '@bunito/container';
import { CONTROLLER_COMPONENT } from '../constants';
import type { ControllerOptions, HttpPath } from '../types';

export function UsePath<TTarget extends Class>(path: HttpPath): ClassDecorator<TTarget> {
  return createComponentOptionsDecorator<ControllerOptions, TTarget>(
    CONTROLLER_COMPONENT,
    {
      kind: 'path',
      path,
    },
  );
}
