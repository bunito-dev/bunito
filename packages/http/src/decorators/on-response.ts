import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ResponseRouteDefinition, ResponseRouteOptions } from '../types';

export function OnResponse(options: ResponseRouteOptions = {}): ClassMethodDecorator {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: ResponseRouteDefinition = {
      propKey: name,
      options: {
        path: '/**',
        method: 'ALL',
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.response] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.response] as ResponseRouteDefinition[]).push(
      definition,
    );
  });
}
