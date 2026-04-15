import type { Class, ClassDecorator } from '@bunito/common';
import { isObject, isString } from '@bunito/common';
import type { ComponentDecoratorOptions } from '@bunito/core/container';
import { createComponentDecorator } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import type { ControllerOptions, HttpPath } from '../types';

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
    HTTP_CONTROLLER,
    path !== '/'
      ? {
          kind: 'path',
          path,
        }
      : undefined,
    providerOptions,
  );
}
