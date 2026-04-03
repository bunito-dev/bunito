import { isClass, isNull, resolveObjectName, resolveSymbolKey } from '../helpers';

export function str(strings: TemplateStringsArray, ...args: Array<unknown>): string {
  return strings.raw
    .map((prefix, index) => {
      const arg = args.at(index);

      let value: string | undefined;

      switch (typeof arg) {
        case 'symbol':
          value = resolveSymbolKey(arg) ?? '[symbol]';
          break;

        case 'function':
          value = resolveObjectName(arg) ?? `[${isClass(arg) ? 'class' : 'fn'}]`;
          break;

        case 'object':
          if (isNull(arg)) {
            value = 'null';
          } else {
            value = arg.toString();

            if (value.startsWith('[')) {
              value = resolveObjectName(arg) ?? '[object]';
            }
          }
          break;

        case 'string':
          value = arg;
          break;

        case 'bigint':
          value = arg.toString();
          break;

        case 'boolean':
          value = arg ? 'true' : 'false';
          break;

        case 'number':
          value = arg.toString(10);
          break;
      }

      return value ? `${prefix}${value}` : prefix;
    })
    .join('');
}
