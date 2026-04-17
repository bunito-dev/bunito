import type { Class, ClassDecorator } from '@bunito/common';
import { isObject, isString } from '@bunito/common';
import type { ComponentDecoratorOptions } from '@bunito/container';
import { createComponentDecorator } from '@bunito/container';
import type { ControllerOptions, HttpPath } from '../types';
import { CONTROLLER_COMPONENT } from './constants';

export function Controller<TController extends Class>(
  options?: ComponentDecoratorOptions,
): ClassDecorator<TController>;
export function Controller<TController extends Class>(
  path: HttpPath,
  options?: ComponentDecoratorOptions,
): ClassDecorator<TController>;
export function Controller<TController extends Class>(
  pathOrOptions?: HttpPath | ComponentDecoratorOptions,
  options: ComponentDecoratorOptions = {},
): ClassDecorator<TController> {
  let path: HttpPath = '/';
  let providerOptions: ComponentDecoratorOptions = {
    scope: 'request',
  };

  if (isString(pathOrOptions)) {
    path = pathOrOptions;

    providerOptions = {
      ...providerOptions,
      ...options,
    };
  } else if (isObject(pathOrOptions)) {
    providerOptions = {
      ...providerOptions,
      ...pathOrOptions,
    };
  }

  return createComponentDecorator<ControllerOptions, TController>(
    CONTROLLER_COMPONENT,
    path !== '/'
      ? {
          kind: 'path',
          path,
        }
      : undefined,
    providerOptions,
  );
}
