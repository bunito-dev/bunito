import { isFn } from './is-fn';
import type { Class } from './types';

export function isClass<
  TInstance extends object = object,
  TArgs extends Array<unknown> = Array<unknown>,
>(value: unknown): value is Class<TInstance, TArgs> {
  return isFn(value) && String(value).startsWith('class ');
}
