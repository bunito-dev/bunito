import type { Fn } from './types';

export function isFn<TValue = unknown, TArgs extends unknown[] = unknown[]>(
  value: unknown,
): value is Fn<TValue, TArgs> {
  return typeof value === 'function';
}
