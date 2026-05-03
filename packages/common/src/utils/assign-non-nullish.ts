import type { RawObject } from '../types';
import { isNullish } from './is-nullish';

export function assignNonNullish<TValue extends RawObject>(
  target: TValue,
  source: Partial<TValue> | null | undefined,
): TValue {
  if (!source) {
    return target;
  }

  for (const [key, value] of Object.entries(source)) {
    if (isNullish(value)) {
      continue;
    }

    (target as RawObject)[key] = value;
  }

  return target;
}
