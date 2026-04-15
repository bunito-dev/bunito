import type { Class, ClassDecorator } from '@bunito/common';
import type { ComponentKey } from '../types';
import { pushComponentOptionsMetadata } from './push-component-options-metadata';

export function createComponentOptionsDecorator<
  TOptions = unknown,
  TComponent extends Class = Class,
>(componentKey: ComponentKey, options: TOptions): ClassDecorator<TComponent> {
  return (target, { metadata }) => {
    pushComponentOptionsMetadata(metadata, componentKey, options);

    return target;
  };
}
