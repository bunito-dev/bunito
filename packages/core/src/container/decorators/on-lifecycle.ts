import type { ClassMethodDecorator, Fn } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { LifecycleEvent, LifecycleProps } from '../types';

export type OnLifecycleHandler = Fn<void | Promise<void>, []>;

export function OnLifecycle<THandler extends OnLifecycleHandler>(
  kind: LifecycleEvent,
): ClassMethodDecorator<THandler> {
  return createImmutableDecorator(({ metadata, name }) => {
    metadata[DECORATOR_METADATA_KEYS.ON_LIFECYCLE] ??= new Map();
    (metadata[DECORATOR_METADATA_KEYS.ON_LIFECYCLE] as LifecycleProps).set(kind, name);
  });
}
