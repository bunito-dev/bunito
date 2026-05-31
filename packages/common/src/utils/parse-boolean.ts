import { isNumber } from './is-number';

export function parseBoolean(value: unknown): boolean | undefined | null {
  let result: boolean | undefined | null;

  switch (typeof value) {
    case 'boolean':
      result = value;
      break;

    case 'string':
      switch (value.trim().toLowerCase()) {
        case 'true':
        case 't':
        case 'yes':
        case 'y':
        case 'on':
          result = true;
          break;

        case 'false':
        case 'f':
        case 'no':
        case 'n':
        case 'off':
          result = false;
          break;

        default:
      }
      break;

    case 'number':
      result = value !== 0 && isNumber(value);
      break;

    default:
      result = null;
  }

  return result;
}
