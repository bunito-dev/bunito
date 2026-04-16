import type { ValueFormat, ValueNumberOptions } from '../types';
import { formatValueAsBoolean } from './format-value-as-boolean';
import { formatValueAsNumber } from './format-value-as-number';
import { formatValueAsString } from './format-value-as-string';

export function formatValueAs(
  value: string,
  format: ValueFormat,
  options: unknown,
): unknown {
  switch (format) {
    case 'boolean':
      return formatValueAsBoolean(value);

    case 'toDecimal':
    case 'toInteger':
      return formatValueAsNumber(
        value,
        format,
        options as ValueNumberOptions | undefined,
      );

    case 'port':
      return formatValueAsNumber(value, 'toInteger', [1, 65535]);

    case 'string':
    case 'toUpperCase':
    case 'toLowerCase':
      return formatValueAsString(value, format, options as string[] | undefined);
  }
}
