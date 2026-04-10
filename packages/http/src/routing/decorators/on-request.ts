import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { ROUTING_METADATA_KEYS } from '../constants';
import type { OnRequestDefinition, OnRequestHandler, OnRequestOptions } from '../types';

export function OnRequest<THandler extends OnRequestHandler>(
  options: OnRequestOptions = {},
): ClassMethodDecorator<THandler> {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: OnRequestDefinition = {
      propKey: name,
      options: {
        path: '/',
        method: 'ALL',
        schema: null,
        ...options,
      },
    };

    metadata[ROUTING_METADATA_KEYS.ON_REQUEST] ??= [];
    (metadata[ROUTING_METADATA_KEYS.ON_REQUEST] as OnRequestDefinition[]).push(
      definition,
    );
  });
}
