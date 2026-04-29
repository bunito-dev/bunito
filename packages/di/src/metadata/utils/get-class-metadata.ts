import type { Class, Fn } from '@bunito/common';
import { isFn, isObject } from '@bunito/common';
import { CLASS_METADATA_KEY } from '../constants';
import type { ClassMetadata } from '../types';
import '../polyfill';

export function getClassMetadata<TOptions = unknown, THandlerOptions = unknown>(
  target: object,
): ClassMetadata<TOptions, THandlerOptions> | undefined {
  let classOrFn: Class | Fn | undefined;

  if (isFn(target)) {
    classOrFn = target;
  } else if (isObject(target)) {
    classOrFn = target.constructor as Class;
  }

  if (!classOrFn) {
    return;
  }

  return classOrFn[Symbol.metadata]?.[CLASS_METADATA_KEY] as
    | ClassMetadata<TOptions, THandlerOptions>
    | undefined;
}
