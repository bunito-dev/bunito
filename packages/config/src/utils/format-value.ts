import { isFn, isObject } from '@bunito/common';
import type { ValueFormat, ValueNumberOptions, ValueParser } from '../types';
import { formatValueAsBoolean } from './format-value-as-boolean';
import { formatValueAsNumber } from './format-value-as-number';
import { formatValueAsString } from './format-value-as-string';

export function formatValue(
  value: unknown,
  formatOrParser?: ValueFormat | ValueParser,
  formatOptions?: unknown,
): unknown {
  if (value === undefined || value === null || value === '') {
    return;
  }

  if (!formatOrParser) {
    return value;
  }

  if (isFn(formatOrParser)) {
    return formatOrParser(value);
  }

  if (isObject(formatOrParser) && 'safeParse' in formatOrParser) {
    const parsed = formatOrParser.safeParse(value);

    if (parsed.success) {
      return parsed.data;
    }
  }

  const format = formatOrParser as ValueFormat;

  switch (format) {
    case 'boolean':
      return formatValueAsBoolean(value);

    case 'toDecimal':
    case 'toInteger':
      return formatValueAsNumber(
        value,
        format,
        formatOptions as ValueNumberOptions | undefined,
      );

    case 'port':
      return formatValueAsNumber(value, 'toInteger', [1, 65535]);

    case 'string':
    case 'toUpperCase':
    case 'toLowerCase':
      return formatValueAsString(value, format, formatOptions as string[] | undefined);
  }
}
