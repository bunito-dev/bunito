import { describe, expect, it } from 'bun:test';
import { formatValue } from './format-value';

describe('formatValue', () => {
  it('returns undefined for empty values', () => {
    expect(formatValue(undefined)).toBeUndefined();
    expect(formatValue(null)).toBeUndefined();
    expect(formatValue('')).toBeUndefined();
  });

  it('returns the raw value when no formatter is provided', () => {
    expect(formatValue('value')).toBe('value');
  });

  it('supports parser functions and safeParse parsers', () => {
    expect(formatValue('42', (value) => String(Number(value)))).toBe('42');
    expect(
      formatValue('ok', {
        safeParse: (value) =>
          value === 'ok'
            ? { success: true as const, data: 'parsed-ok' }
            : { success: false as const },
      }),
    ).toBe('parsed-ok');
    expect(
      formatValue('bad', {
        safeParse: () => ({ success: false as const }),
      }),
    ).toBeUndefined();
  });

  it('delegates to built-in formatters', () => {
    expect(formatValue('true', 'boolean')).toBeTrue();
    expect(formatValue('8080', 'port')).toBe(8080);
    expect(formatValue('42', 'toInteger')).toBe(42);
    expect(formatValue('VALUE', 'toLowerCase')).toBe('value');
  });
});
