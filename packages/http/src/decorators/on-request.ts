import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { RequestRouteDefinition, RequestRouteOptions } from '../types';

export function OnRequest(options: RequestRouteOptions = {}): ClassMethodDecorator {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: RequestRouteDefinition = {
      propKey: name,
      options: {
        path: '/',
        method: 'ALL',
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.request] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.request] as RequestRouteDefinition[]).push(
      definition,
    );
  });
}
