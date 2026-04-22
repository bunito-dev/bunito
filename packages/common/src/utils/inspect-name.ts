import { isClass } from './is-class';

export function inspectName(value: unknown): string {
  let name: string | undefined;

  switch (typeof value) {
    case 'symbol':
      name = Symbol.keyFor(value);

      if (name === undefined) {
        name = value.toString().slice(7, -1);
      }
      if (!name) {
        name = '[symbol]';
      }
      break;

    case 'function':
      name = value.name;

      if (!name && !isClass(value)) {
        name = `[fn ${value.name ? value.name : '(anonymous)'}]`;
      }
      break;

    case 'object':
      if (value === null) {
        name = '[null]';
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          name = '[empty]';
        } else {
          name = value.map(inspectName).join(' → ');
        }
      } else {
        if (!(Bun.inspect.custom in value)) {
          name = value.constructor?.name;

          if (!name || name === 'Object') {
            name = `[object (anonymous)]`;
          }
        }
      }
      break;

    case 'string':
      name = value ? value : '[string]';
      break;
  }

  return name ? name : Bun.inspect(value, { compact: true, depth: 1, colors: false });
}
