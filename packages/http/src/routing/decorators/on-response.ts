import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { OnResponseDefinition, OnResponseOptions } from '../types';

export function OnResponse(
  options: OnResponseOptions = {},
): ClassMethodDecorator<(request: Request) => Response> {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: OnResponseDefinition = {
      propKey: name,
      options: {
        method: 'ALL',
        params: null,
        query: null,
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.ON_RESPONSE] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.ON_RESPONSE] as OnResponseDefinition[]).push(
      definition,
    );
  });
}
