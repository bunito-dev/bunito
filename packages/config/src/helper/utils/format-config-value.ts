import { isNumber, isString } from '@bunito/common';
import type { ConfigFormat } from '../types';

export function formatConfigValue(value: unknown, format: ConfigFormat): unknown {
  switch (format) {
    case 'boolean':
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
      break;

    case 'string':
    case 'uppercase':
    case 'lowercase':
      if (isString(value, true)) {
        switch (format) {
          case 'uppercase':
            return value.toUpperCase();

          case 'lowercase':
            return value.toLowerCase();

          default:
            return value;
        }
      }
      break;

    case 'integer':
    case 'decimal':
    case 'port': {
      let result: number;

      switch (typeof value) {
        case 'number':
          result = value;
          break;

        case 'string': {
          const prepared = value.replace(/_/g, '');

          switch (format) {
            case 'decimal':
              result = Number.parseFloat(prepared);
              break;

            case 'integer':
            case 'port':
              result = Number.parseInt(prepared, 10);
              break;
          }
          break;
        }

        default:
          return;
      }

      switch (format) {
        case 'integer':
          if (Number.isSafeInteger(result)) {
            return result;
          }
          break;

        case 'decimal':
          if (Number.isFinite(result)) {
            return result;
          }
          break;

        case 'port':
          if (result >= 0 && result <= 65535) {
            return result;
          }
          break;
      }
    }
  }
}
