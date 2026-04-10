import type { Class, ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { ROUTING_METADATA_KEYS } from '../constants';
import type { RoutePath } from '../types';

export function UsesPath<TTarget extends Class>(
  path: RoutePath,
): ClassDecorator<TTarget> {
  return createImmutableDecorator(({ metadata }) => {
    metadata[ROUTING_METADATA_KEYS.USES_PATH] = path;
  });
}
