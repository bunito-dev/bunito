import type { ValueStringFormat } from '../types';

export function formatValueAsString(
  value: string,
  format: ValueStringFormat,
  options: ArrayLike<string> | undefined,
): string | undefined {
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
