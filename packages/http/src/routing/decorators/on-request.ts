import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { RouteRequestDefinition, RouteRequestOptions } from '../types';

export function OnRequest(options: RouteRequestOptions = {}): ClassMethodDecorator {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: RouteRequestDefinition = {
      propKey: name,
      options: {
        path: '/',
        method: 'ALL',
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.REQUEST] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.REQUEST] as RouteRequestDefinition[]).push(
      definition,
    );
  });
}
