import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator, isString } from '@bunito/common';
import type { HttpMethod } from '../../types';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type {
  RouteRequestDefinition,
  RouteRequestOptions,
  RouteRequestOptionsLike,
} from '../types';

export function OnRequest<TOmit extends keyof RouteRequestOptions = never>(
  optionLike?: RouteRequestOptionsLike<TOmit>,
  defaultMethod: HttpMethod = 'ALL',
): ClassMethodDecorator {
  let options: RouteRequestOptions;

  if (isString(optionLike)) {
    options = {
      path: optionLike,
    };
  } else if (optionLike) {
    options = optionLike;
  }

  return createImmutableDecorator(({ metadata, name }) => {
    const definition: RouteRequestDefinition = {
      propKey: name,
      options: {
        path: '/',
        method: defaultMethod,
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.ON_REQUEST] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.ON_REQUEST] as RouteRequestDefinition[]).push(
      definition,
    );
  });
}
