import type { ClassFieldDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ComponentKey, ComponentProp } from '../types';

export function createComponentFieldDecorator<TOptions = unknown, TValue = unknown>(
  componentKey: ComponentKey,
  options?: TOptions,
): ClassFieldDecorator<TValue> {
  return (target, { metadata, name: propKey }) => {
    metadata[DECORATOR_METADATA_KEYS.COMPONENT_FIELDS] ??= new Map();

    (
      metadata[DECORATOR_METADATA_KEYS.COMPONENT_FIELDS] as Map<
        ComponentKey,
        ComponentProp[]
      >
    )
      .getOrInsertComputed(componentKey, () => [])
      .push({ propKey, options });

    return target;
  };
}
