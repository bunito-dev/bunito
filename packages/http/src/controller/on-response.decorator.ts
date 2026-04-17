import type { ClassMethodDecorator } from '@bunito/common';
import { createComponentMethodDecorator } from '@bunito/container';
import type {
  ControllerMethodOptions,
  OnResponseHandler,
  OnResponseOptions,
} from '../types';
import { CONTROLLER_COMPONENT } from './constants';

export function OnResponse<THandler extends OnResponseHandler>(
  options: OnResponseOptions = {},
): ClassMethodDecorator<THandler> {
  return createComponentMethodDecorator<ControllerMethodOptions, THandler>(
    CONTROLLER_COMPONENT,
    {
      kind: 'onResponse',
      method: 'ALL',
      ...options,
    },
  );
}
