import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { RouteErrorDefinition, RouteErrorOptions } from '../types';

export function OnError(options: RouteErrorOptions = {}): ClassMethodDecorator {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: RouteErrorDefinition = {
      propKey: name,
      options: {
        method: 'ALL',
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.ON_ERROR] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.ON_ERROR] as RouteErrorDefinition[]).push(
      definition,
    );
  });
}
