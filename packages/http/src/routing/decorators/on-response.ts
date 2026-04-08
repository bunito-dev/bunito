import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { RouteResponseDefinition, RouteResponseOptions } from '../types';

export function OnResponse(options: RouteResponseOptions = {}): ClassMethodDecorator {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: RouteResponseDefinition = {
      propKey: name,
      options: {
        method: 'ALL',
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.ON_RESPONSE] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.ON_RESPONSE] as RouteResponseDefinition[]).push(
      definition,
    );
  });
}
