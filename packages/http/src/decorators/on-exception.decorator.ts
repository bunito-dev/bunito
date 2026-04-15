import type { ClassMethodDecorator } from '@bunito/common';
import { createComponentMethodDecorator } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import type {
  ControllerMethodOptions,
  OnExceptionHandler,
  OnExceptionOptions,
} from '../types';

export function OnException<THandler extends OnExceptionHandler>(
  options: OnExceptionOptions = {},
): ClassMethodDecorator<THandler> {
  return createComponentMethodDecorator<ControllerMethodOptions, THandler>(
    HTTP_CONTROLLER,
    {
      kind: 'onException',
      method: 'ALL',
      ...options,
    },
  );
}
