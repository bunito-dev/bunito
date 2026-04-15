import type { ClassMethodDecorator, Fn } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ComponentKey, ComponentProp } from '../types';

export function createComponentMethodDecorator<
  TOptions = unknown,
  THandler extends Fn = Fn,
>(componentKey: ComponentKey, options?: TOptions): ClassMethodDecorator<THandler> {
  return (target, { metadata, name: propKey }) => {
    metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] ??= new Map();

    (
      metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<
        ComponentKey,
        ComponentProp[]
      >
    )
      .getOrInsertComputed(componentKey, () => [])
      .push({ propKey, options });

    return target;
  };
}
