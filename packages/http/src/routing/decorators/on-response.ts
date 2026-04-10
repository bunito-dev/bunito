import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { ROUTING_METADATA_KEYS } from '../constants';
import type {
  OnResponseDefinition,
  OnResponseHandler,
  OnResponseOptions,
} from '../types';

export function OnResponse<THandler extends OnResponseHandler>(
  options: OnResponseOptions = {},
): ClassMethodDecorator<THandler> {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: OnResponseDefinition = {
      propKey: name,
      options: {
        method: 'ALL',
        ...options,
      },
    };

    metadata[ROUTING_METADATA_KEYS.ON_RESPONSE] ??= [];
    (metadata[ROUTING_METADATA_KEYS.ON_RESPONSE] as OnResponseDefinition[]).push(
      definition,
    );
  });
}
