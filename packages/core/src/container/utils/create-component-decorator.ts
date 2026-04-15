import type { Class, ClassDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ComponentKey, ProviderDecoratorOptions } from '../types';
import { pushComponentOptionsMetadata } from './push-component-options-metadata';

export function createComponentDecorator<
  TOptions = unknown,
  TComponent extends Class = Class,
>(
  componentKey: ComponentKey,
  options?: TOptions,
  providerOptions: ProviderDecoratorOptions = {},
): ClassDecorator<TComponent> {
  return (target, { metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.COMPONENT_KEYS] ??= new Set();

    (metadata[DECORATOR_METADATA_KEYS.COMPONENT_KEYS] as Set<ComponentKey>).add(
      componentKey,
    );

    if (options) {
      pushComponentOptionsMetadata(metadata, componentKey, options);
    }

    metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS] = {
      scope: 'transient',
      ...providerOptions,
    };

    return target;
  };
}
