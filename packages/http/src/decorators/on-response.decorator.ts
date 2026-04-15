import type { ClassMethodDecorator } from '@bunito/common';
import { createComponentMethodDecorator } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import type {
  ControllerMethodOptions,
  OnResponseHandler,
  OnResponseOptions,
} from '../types';

export function OnResponse<THandler extends OnResponseHandler>(
  options: OnResponseOptions = {},
): ClassMethodDecorator<THandler> {
  return createComponentMethodDecorator<ControllerMethodOptions, THandler>(
    HTTP_CONTROLLER,
    {
      kind: 'onResponse',
      method: 'ALL',
      ...options,
    },
  );
}
