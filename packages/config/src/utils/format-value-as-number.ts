import { isObject } from '@bunito/common';
import type { ValueNumberFormat, ValueNumberOptions } from '../types';

export function formatValueAsNumber(
  value: string,
  format: ValueNumberFormat,
  options: ValueNumberOptions | undefined,
): number | undefined {
  let result: number | undefined;

  const prepared = value.replace(/_/g, '');

  switch (format) {
    case 'toDecimal':
      result = Number.parseFloat(prepared);
      break;

    case 'toInteger':
      result = Number.parseInt(prepared, 10);
      break;
  }

  if (Number.isNaN(result)) {
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
