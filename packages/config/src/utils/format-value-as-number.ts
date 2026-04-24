import { isNumber, isObject } from '@bunito/common';
import type { ValueNumberFormat, ValueNumberOptions } from '../types';

export function formatValueAsNumber(
  value: unknown,
  format: ValueNumberFormat,
  options: ValueNumberOptions | undefined,
): number | undefined {
  let result: number | undefined;

  switch (typeof value) {
    case 'number':
      result = value;
      break;

    case 'string': {
      const prepared = value.replace(/_/g, '');

      switch (format) {
        case 'toDecimal':
          result = Number.parseFloat(prepared);
          break;

        case 'toInteger':
          result = Number.parseInt(prepared, 10);
          break;
      }
      break;
    }
  }

  if (!isNumber(result)) {
    return;
  }

  if (isObject(options)) {
    const [min, max] = options;

    if (min !== undefined && result < min) {
      return;
    }

    if (max !== undefined && result > max) {
      return;
    }
  }

  return result;
}
