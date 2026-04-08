import type { ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { RoutePath } from '../types';

export function UsesPath(path: RoutePath): ClassDecorator {
  return createImmutableDecorator(({ metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.USES_PATH] = path;
  });
}
