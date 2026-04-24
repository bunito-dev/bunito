import { isNumber } from '@bunito/common';

export function formatValueAsBoolean(value: unknown): boolean | undefined {
  switch (typeof value) {
    case 'boolean':
      return value;

    case 'string':
      switch (value.trim().toLowerCase()) {
        case 'true':
        case 't':
        case 'yes':
        case 'y':
        case 'on':
          return true;

        case 'false':
        case 'f':
        case 'no':
        case 'n':
        case 'off':
          return false;

        default:
          return;
      }

    case 'number':
      return value !== 0 && isNumber(value);
  }
}
