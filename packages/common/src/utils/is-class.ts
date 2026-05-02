import type { Class } from '../types';
import { isFn } from './is-fn';

export function isClass<
  TInstance extends object = object,
  TArgs extends unknown[] = unknown[],
>(value: unknown): value is Class<TInstance, TArgs> {
  return isFn(value) && String(value).startsWith('class ');
}
