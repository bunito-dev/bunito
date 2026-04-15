import { describe, expect, it } from 'bun:test';
import { formatValueAs } from './format-value-as';

describe('formatValueAs', () => {
  it('delegates to the correct formatter', () => {
    expect(formatValueAs('true', 'boolean', undefined)).toBe(true);
    expect(formatValueAs('42', 'port', undefined)).toBe(42);
    expect(formatValueAs('5', 'toInteger', undefined)).toBe(5);
    expect(formatValueAs('allowed', 'string', ['allowed'])).toBe('allowed');
    expect(formatValueAs('ABC', 'toLowerCase', undefined)).toBe('abc');
  });
});
