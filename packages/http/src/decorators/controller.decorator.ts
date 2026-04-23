import type { Class } from '@bunito/common';
import { isObject, isString } from '@bunito/common';
import type {
  ClassDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { Component } from '@bunito/container/internals';
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
  let prefix: HttpPath | undefined;
  let providerOptions: ProviderDecoratorOptions = {};

  if (isString(prefixOrOptions)) {
    prefix = prefixOrOptions;

    if (isObject(extraOptions)) {
      providerOptions = extraOptions;
    }
  } else if (isObject(prefixOrOptions)) {
    ({ prefix, ...providerOptions } = prefixOrOptions);
  }

  return Component<Class, ControllerOptions>(
    'Controller',
    CONTROLLER_COMPONENT,
    prefix ? { kind: 'prefix', prefix } : undefined,
    {
      scope: 'request',
      ...providerOptions,
    },
  );
}
