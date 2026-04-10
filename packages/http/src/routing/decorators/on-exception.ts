import type { ClassMethodDecorator } from '@bunito/common';
import { createImmutableDecorator } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type {
  OnExceptionDefinition,
  OnExceptionHandler,
  OnExceptionOptions,
} from '../types';

export function OnException<THandler extends OnExceptionHandler>(
  options: OnExceptionOptions = {},
): ClassMethodDecorator<THandler> {
  return createImmutableDecorator(({ metadata, name }) => {
    const definition: OnExceptionDefinition = {
      propKey: name,
      options: {
        method: 'ALL',
        ...options,
      },
    };

    metadata[DECORATOR_METADATA_KEYS.ON_EXCEPTION] ??= [];
    (metadata[DECORATOR_METADATA_KEYS.ON_EXCEPTION] as OnExceptionDefinition[]).push(
      definition,
    );
  });
}
