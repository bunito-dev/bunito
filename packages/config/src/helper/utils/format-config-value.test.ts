import { describe, expect, it } from 'bun:test';
import { formatConfigValue } from './format-config-value';

describe('formatConfigValue', () => {
  it('formats boolean values', () => {
    expect(formatConfigValue(true, 'boolean')).toBeTrue();
    expect(formatConfigValue(false, 'boolean')).toBeFalse();
    expect(formatConfigValue('true', 'boolean')).toBeTrue();
    expect(formatConfigValue(' yes ', 'boolean')).toBeTrue();
    expect(formatConfigValue('f', 'boolean')).toBeFalse();
    expect(formatConfigValue('n', 'boolean')).toBeFalse();
    expect(formatConfigValue('off', 'boolean')).toBeFalse();
    expect(formatConfigValue(1, 'boolean')).toBeTrue();
    expect(formatConfigValue(0, 'boolean')).toBeFalse();
    expect(formatConfigValue('unknown', 'boolean')).toBeUndefined();
    expect(formatConfigValue({}, 'boolean')).toBeUndefined();
  });

  it('formats string values', () => {
    expect(formatConfigValue('value', 'string')).toBe('value');
    expect(formatConfigValue('value', 'uppercase')).toBe('VALUE');
    expect(formatConfigValue('VALUE', 'lowercase')).toBe('value');
    expect(formatConfigValue('', 'string')).toBe('');
    expect(formatConfigValue(123, 'string')).toBeUndefined();
  });

  it('formats numeric values', () => {
    expect(formatConfigValue('1_024', 'integer')).toBe(1024);
    expect(formatConfigValue(1024, 'integer')).toBe(1024);
    expect(formatConfigValue('12.5', 'decimal')).toBe(12.5);
    expect(formatConfigValue(12.5, 'decimal')).toBe(12.5);
    expect(formatConfigValue('8080', 'port')).toBe(8080);
    expect(formatConfigValue(Number.NaN, 'integer')).toBeUndefined();
    expect(formatConfigValue(Number.POSITIVE_INFINITY, 'decimal')).toBeUndefined();
    expect(formatConfigValue('-1', 'port')).toBeUndefined();
    expect(formatConfigValue('65536', 'port')).toBeUndefined();
    expect(formatConfigValue({}, 'integer')).toBeUndefined();
  });
});
