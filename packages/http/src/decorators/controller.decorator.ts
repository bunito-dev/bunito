import { isObject, isString } from '@bunito/common';
import type {
  ClassDecorator,
  ProviderDecoratorOptions,
} from '@bunito/container/internals';
import { createComponentDecorator } from '@bunito/container/internals';
import type { ControllerOptions, HTTPPath } from '../types';
import type { ControllerDecoratorOptions } from './types';

export function Controller(): ClassDecorator;
export function Controller(options: ControllerDecoratorOptions): ClassDecorator;
export function Controller(
  prefix: HTTPPath,
  providerOptions?: ProviderDecoratorOptions,
): ClassDecorator;
export function Controller(
  prefixOrOptions?: HTTPPath | ControllerDecoratorOptions,
  extraOptions?: ProviderDecoratorOptions,
): ClassDecorator {
  let prefix: HTTPPath;
  let providerOptions: ProviderDecoratorOptions;

  if (isString(prefixOrOptions)) {
    prefix = prefixOrOptions;
    providerOptions = extraOptions ?? {};
  } else if (isObject(prefixOrOptions)) {
    ({ prefix = '/', ...providerOptions } = prefixOrOptions);
  } else {
    prefix = '/';
    providerOptions = {};
  }

  return createComponentDecorator<ControllerOptions>(
    Controller,
    {
      prefix,
    },
    {
      scope: 'request',
      ...providerOptions,
    },
  );
}
