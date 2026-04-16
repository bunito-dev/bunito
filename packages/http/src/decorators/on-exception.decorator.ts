import type { ClassMethodDecorator } from '@bunito/common';
import { createComponentMethodDecorator } from '@bunito/container';
import { CONTROLLER_COMPONENT } from '../constants';
import type {
  ControllerMethodOptions,
  OnExceptionHandler,
  OnExceptionOptions,
} from '../types';

export function OnException<THandler extends OnExceptionHandler>(
  options: OnExceptionOptions = {},
): ClassMethodDecorator<THandler> {
  return createComponentMethodDecorator<ControllerMethodOptions, THandler>(
    CONTROLLER_COMPONENT,
    {
      kind: 'onException',
      method: 'ALL',
      ...options,
    },
  );
}
