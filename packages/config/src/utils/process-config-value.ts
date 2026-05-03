import { isFn, isNullish, isNumber, isObject, isString } from '@bunito/common';
import type { ConfigFormat, ConfigParser } from '../types';

export function processConfigValue(
  value: unknown,
  format: ConfigFormat | undefined,
  parser: ConfigParser | undefined,
): unknown {
  if (isNullish(value) || !format) {
    return value;
  }

  let result: unknown;

  switch (format) {
    case 'boolean':
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
      break;

    case 'string':
    case 'uppercase':
    case 'lowercase':
      if (isString(value, true)) {
        switch (format) {
          case 'uppercase':
            result = value.toUpperCase();
            break;

          case 'lowercase':
            result = value.toLowerCase();
            break;

          default:
            result = value;
            break;
        }
      } else {
        result = null;
      }
      break;

    case 'integer':
    case 'decimal':
    case 'port': {
      let num: number | undefined;

      switch (typeof value) {
        case 'number':
          num = value;
          break;

        case 'string': {
          const prepared = value.replace(/_/g, '');

          switch (format) {
            case 'decimal':
              num = Number.parseFloat(prepared);
              break;

            case 'integer':
            case 'port':
              num = Number.parseInt(prepared, 10);
              break;
          }
          break;
        }

        default:
          result = null;
      }

      switch (format) {
        case 'integer':
          if (Number.isSafeInteger(num)) {
            result = num;
          }
          break;

        case 'decimal':
          if (Number.isFinite(num)) {
            result = num;
          }
          break;

        case 'port':
          if (num !== undefined && num >= 0 && num <= 65535) {
            result = num;
          }
          break;
      }
    }
  }

  if (isNullish(result) || !parser) {
    return result;
  }

  if (isFn(parser)) {
    return parser(result);
  }

  if (isObject(parser)) {
    return parser.parse(result);
  }
}
