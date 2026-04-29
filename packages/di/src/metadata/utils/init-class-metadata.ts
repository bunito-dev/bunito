import type { Class, Fn } from '@bunito/common';
import { CLASS_METADATA_KEY } from '../constants';
import type { ClassMetadata, ClassPropOptionsSchema } from '../types';
import '../polyfill';

export function initClassMetadata<
  TOptions = unknown,
  THandlerOptions = unknown,
  TPropOptionsSchema extends ClassPropOptionsSchema = ClassPropOptionsSchema,
>(target: Class | Fn): ClassMetadata<TOptions, THandlerOptions, TPropOptionsSchema> {
  target[Symbol.metadata] ??= {};

  const metadata = target[Symbol.metadata] as {
    [CLASS_METADATA_KEY]?: ClassMetadata<TOptions, THandlerOptions, TPropOptionsSchema>;
  };

  metadata[CLASS_METADATA_KEY] ??= {};

  return metadata[CLASS_METADATA_KEY];
}
