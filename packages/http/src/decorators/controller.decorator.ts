import type { Class } from '@bunito/common';
import { isObject, isString } from '@bunito/common';
import type { ClassDecorator } from '@bunito/container';
import { Component } from '@bunito/container';
import type { HttpPath } from '@bunito/server';
import { CONTROLLER_COMPONENT } from '../constants';
import type { ControllerOptions } from '../types';
import type { ControllerDecoratorOptions } from './types';

export function Controller(
  prefix?: HttpPath,
  options?: Omit<ControllerDecoratorOptions, 'prefix'>,
): ClassDecorator;
export function Controller(options: ControllerDecoratorOptions): ClassDecorator;
export function Controller(
  prefixOrOptions?: HttpPath | ControllerDecoratorOptions,
  extraOptions?: Omit<ControllerDecoratorOptions, 'prefix'>,
): ClassDecorator {
  let decoratorOptions: ControllerDecoratorOptions = {};

  if (isString(prefixOrOptions)) {
    decoratorOptions.prefix = prefixOrOptions;

    if (isObject(extraOptions)) {
      decoratorOptions = {
        ...decoratorOptions,
        ...extraOptions,
      };
    }
  } else if (isObject(prefixOrOptions)) {
    decoratorOptions = {
      ...prefixOrOptions,
    };
  }

  const { prefix, middleware, ...providerOptions } = decoratorOptions;

  return Component<Class, ControllerOptions>(
    'Controller',
    CONTROLLER_COMPONENT,
    {
      prefix,
      middleware,
    },
    {
      scope: 'request',
      ...providerOptions,
    },
  );
}
