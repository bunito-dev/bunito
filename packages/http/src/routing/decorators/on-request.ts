import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type {
  OnRequestDefinition,
  OnRequestOptions,
  OnRequestOptionsLike,
  RouteMethod,
  RoutePath,
} from '../types';

export function OnRequest<TOmit extends keyof OnRequestOptions = never>(
  path: RoutePath = '/',
  options: Partial<OnRequestOptionsLike<TOmit>> = {},
  defaultMethod: RouteMethod = 'ALL',
): ClassMethodDecorator {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: OnRequestDefinition = {
      propKey: name,
      options: {
        path,
        method: defaultMethod,
        params: null,
        query: null,
        body: null,
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.ON_REQUEST] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.ON_REQUEST] as OnRequestDefinition[]).push(
      definition,
    );
  });
}
