import { isString } from '@bunito/common';
import type { ControllerOptions } from '../compiler';
import { CLASS_METADATA_KEYS } from './constants';
import type { ClassDecorator, ProviderDecoratorOptions } from './types';
import { setProviderMetadataOptions } from './utils';

type ControllerProviderOptions = ProviderDecoratorOptions<'token' | 'global'>;
type ControllerDecoratorOptions = ControllerProviderOptions & ControllerOptions;

export function Controller(
  prefix?: string,
  options?: ControllerProviderOptions,
): ClassDecorator;
export function Controller(options: ControllerDecoratorOptions): ClassDecorator;
export function Controller(
  prefixOrOptions?: string | ControllerDecoratorOptions,
  options: ControllerProviderOptions = {},
): ClassDecorator {
  let prefix: string | undefined;
  let providerOptions: ProviderDecoratorOptions;

  if (isString(prefixOrOptions) || prefixOrOptions === undefined) {
    prefix = prefixOrOptions;
    providerOptions = options;
  } else {
    ({ prefix, ...providerOptions } = prefixOrOptions);
  }

  const controllerOptions: ControllerOptions = {
    prefix,
  };

  return (target, context) => {
    setProviderMetadataOptions(Controller, context, {
      scope: 'request',
      ...providerOptions,
    });

    context.metadata[CLASS_METADATA_KEYS.controller] = controllerOptions;

    return target;
  };
}
