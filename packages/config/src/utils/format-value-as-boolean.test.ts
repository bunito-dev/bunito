import { describe, expect, it } from 'bun:test';
import { formatValueAsBoolean } from './format-value-as-boolean';

describe('formatValueAsBoolean', () => {
  it('parses supported boolean values', () => {
    expect(formatValueAsBoolean('YES')).toBe(true);
    expect(formatValueAsBoolean('t')).toBe(true);
    expect(formatValueAsBoolean('On')).toBe(true);
    expect(formatValueAsBoolean('FALSE')).toBe(false);
    expect(formatValueAsBoolean('n')).toBe(false);
    expect(formatValueAsBoolean('off')).toBe(false);
    expect(formatValueAsBoolean('unknown')).toBeUndefined();
  });
});
