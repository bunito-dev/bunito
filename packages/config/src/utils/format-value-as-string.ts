import { isString } from '@bunito/common';
import type { ValueStringFormat } from '../types';

export function formatValueAsString(
  value: unknown,
  format: ValueStringFormat,
  options: ArrayLike<string> | undefined,
): string | undefined {
  if (!isString(value)) {
    return;
  }

  let result: string;

  switch (format) {
    case 'string':
      result = value;
      break;

    case 'toUpperCase':
      result = value.toUpperCase();
      break;

    case 'toLowerCase':
      result = value.toLowerCase();
      break;
  }

  if (Array.isArray(options) && !options.includes(result)) {
    return;
  }

  return result;
}
