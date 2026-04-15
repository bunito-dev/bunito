import { describe, expect, it } from 'bun:test';
import { formatValueAsString } from './format-value-as-string';

describe('formatValueAsString', () => {
  it('formats strings and enforces allowed values', () => {
    expect(formatValueAsString('value', 'string', undefined)).toBe('value');
    expect(formatValueAsString('value', 'toUpperCase', ['VALUE'])).toBe('VALUE');
    expect(formatValueAsString('VALUE', 'toLowerCase', ['value'])).toBe('value');
    expect(formatValueAsString('value', 'toLowerCase', ['other'])).toBeUndefined();
  });
});
