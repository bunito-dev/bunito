import { isClass } from './is-class';
import { isFn } from './is-fn';

export function resolveName(value: unknown): string {
  let name: string | undefined;

  switch (typeof value) {
    case 'function':
    case 'object':
      if (isFn(value)) {
        name = value.name ? value.name : isClass(value) ? 'anonymous' : 'arrow';
      } else {
        name = value ? value.constructor.name : 'null';
      }
      break;

    case 'symbol': {
      name = Symbol.keyFor(value);
      if (!name) {
        name = value.toString().slice(7, -1);
      }
      break;
    }

    case 'string':
      return value;
  }

  return name ? name : typeof value;
}
