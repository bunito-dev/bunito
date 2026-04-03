import type { Fn } from './types';

export function isFn<TValue = unknown, TArgs extends Array<unknown> = Array<unknown>>(
  value: unknown,
): value is Fn<TValue, TArgs> {
  return typeof value === 'function';
}
