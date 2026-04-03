import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { LifecycleEvent, LifecycleProps } from '../types';

export function createLifecycleDecorator(
  event: LifecycleEvent,
): () => ClassMethodDecorator {
  return () =>
    createImmutableDecorator(({ metadata, name }) => {
      metadata[DECORATOR_METADATA_KEYS.lifecycle] ??= new Map();
      (metadata[DECORATOR_METADATA_KEYS.lifecycle] as LifecycleProps).set(event, name);
    });
}
