import './polyfill';

import type { Fn } from '@bunito/common';
import { isFn, isObject } from '@bunito/common';
import type { ControllerOptions } from '../../compiler';
import { CLASS_METADATA_KEYS } from '../constants';
import type {
  ClassMetadataKind,
  ClassPropsMetadata,
  ModuleMetadata,
  ProviderMetadata,
} from '../types';

export function getClassMetadata(
  target: unknown,
  kind: 'module',
): ModuleMetadata | undefined;
export function getClassMetadata(
  target: unknown,
  kind: 'provider',
): ProviderMetadata | undefined;
export function getClassMetadata(
  target: unknown,
  kind: 'controller',
): ControllerOptions | undefined;
export function getClassMetadata(
  target: unknown,
  kind: 'props',
): ClassPropsMetadata | undefined;
export function getClassMetadata(target: unknown, kind: ClassMetadataKind): unknown {
  let targetFn: Fn | undefined;

  if (isFn(target)) {
    targetFn = target;
  } else if (isObject(target)) {
    targetFn = target.constructor as Fn;
  }

  return targetFn?.[Symbol.metadata]?.[CLASS_METADATA_KEYS[kind]];
}
