import type { ClassDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { HttpPath } from '../types';

export function UsesPath(path: HttpPath): ClassDecorator {
  return createImmutableDecorator(({ metadata }) => {
    metadata[DECORATOR_METADATA_KEYS.path] = path;
  });
}
