import { isString } from '@bunito/common';
import type { ClassMethodDecorator } from '@bunito/container/internals';
import { createClassPropDecorator } from '@bunito/container/internals';
import { BROKER_CONTROLLER_KEY } from '../constants';
import type { ControllerMethodOptions, HandlerOptions } from '../types';
import type { HandlerDecorator } from './types';

export function OnMessage(
  pattern: string,
  options?: Omit<HandlerOptions, 'pattern'>,
): HandlerDecorator;
export function OnMessage(options: HandlerOptions): HandlerDecorator;
export function OnMessage(
  patternOrOptions: string | HandlerOptions,
  extraOptions: Omit<HandlerOptions, 'pattern'> = {},
): HandlerDecorator {
  let options: HandlerOptions;

  if (isString(patternOrOptions)) {
    options = {
      pattern: patternOrOptions,
      ...extraOptions,
    };
  } else {
    options = patternOrOptions;
  }

  return createClassPropDecorator<ControllerMethodOptions, ClassMethodDecorator>(
    BROKER_CONTROLLER_KEY,
    {
      kind: 'handler',
      options,
    },
  );
}
