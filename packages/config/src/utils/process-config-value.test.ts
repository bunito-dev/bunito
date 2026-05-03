import { describe, expect, it } from 'bun:test';
import { processConfigValue } from './process-config-value';

describe('processConfigValue', () => {
  it('returns nullish values and unformatted values unchanged', () => {
    expect(processConfigValue(undefined, 'string', undefined)).toBeUndefined();
    expect(processConfigValue(null, 'boolean', undefined)).toBeNull();
    expect(processConfigValue('value', undefined, undefined)).toBe('value');
  });

  it('formats boolean values from booleans, strings, and numbers', () => {
    expect(processConfigValue(true, 'boolean', undefined)).toBeTrue();
    expect(processConfigValue(false, 'boolean', undefined)).toBeFalse();
    expect(processConfigValue('yes', 'boolean', undefined)).toBeTrue();
    expect(processConfigValue('t', 'boolean', undefined)).toBeTrue();
    expect(processConfigValue('y', 'boolean', undefined)).toBeTrue();
    expect(processConfigValue('on', 'boolean', undefined)).toBeTrue();
    expect(processConfigValue('false', 'boolean', undefined)).toBeFalse();
    expect(processConfigValue('f', 'boolean', undefined)).toBeFalse();
    expect(processConfigValue('no', 'boolean', undefined)).toBeFalse();
    expect(processConfigValue('n', 'boolean', undefined)).toBeFalse();
    expect(processConfigValue('off', 'boolean', undefined)).toBeFalse();
    expect(processConfigValue(1, 'boolean', undefined)).toBeTrue();
    expect(processConfigValue(0, 'boolean', undefined)).toBeFalse();
    expect(processConfigValue({}, 'boolean', undefined)).toBeNull();
    expect(processConfigValue('maybe', 'boolean', undefined)).toBeUndefined();
  });

  it('formats string values and rejects non-string values', () => {
    expect(processConfigValue('value', 'string', undefined)).toBe('value');
    expect(processConfigValue('value', 'uppercase', undefined)).toBe('VALUE');
    expect(processConfigValue('VALUE', 'lowercase', undefined)).toBe('value');
    expect(processConfigValue('', 'string', undefined)).toBe('');
    expect(processConfigValue(42, 'string', undefined)).toBeNull();
  });

  it('formats numeric values from numbers and strings', () => {
    expect(processConfigValue(42, 'integer', undefined)).toBe(42);
    expect(processConfigValue('1_024', 'integer', undefined)).toBe(1024);
    expect(processConfigValue('10.5', 'decimal', undefined)).toBe(10.5);
    expect(processConfigValue(8080, 'port', undefined)).toBe(8080);
    expect(processConfigValue('65536', 'port', undefined)).toBeUndefined();
    expect(processConfigValue(Number.NaN, 'integer', undefined)).toBeUndefined();
    expect(processConfigValue({}, 'decimal', undefined)).toBeNull();
  });

  it('passes formatted values through function and object parsers', () => {
    const parsedWithFunction = processConfigValue(
      'value',
      'uppercase',
      (value) => `parsed:${value}`,
    );
    const parsedWithObject = processConfigValue('42', 'integer', {
      parse: (value: unknown) => ({
        value,
      }),
    } as never);

    expect(parsedWithFunction).toBe('parsed:VALUE');
    expect(parsedWithObject).toEqual({
      value: 42,
    });
  });

  it('returns undefined when a parser-like value cannot parse', () => {
    expect(processConfigValue('value', 'string', true as never)).toBeUndefined();
  });
});
