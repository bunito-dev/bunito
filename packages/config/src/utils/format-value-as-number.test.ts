import { describe, expect, it } from 'bun:test';
import { formatValueAsNumber } from './format-value-as-number';

describe('formatValueAsNumber', () => {
  it('parses integer and decimal values with limits', () => {
    expect(formatValueAsNumber(1024, 'toInteger', undefined)).toBe(1024);
    expect(formatValueAsNumber('1_024', 'toInteger', undefined)).toBe(1024);
    expect(formatValueAsNumber('1.5', 'toDecimal', [1, 2])).toBe(1.5);
    expect(formatValueAsNumber('1.9', 'toInteger', undefined)).toBe(1);
    expect(formatValueAsNumber('0', 'toInteger', [1, undefined])).toBeUndefined();
    expect(formatValueAsNumber('10', 'toInteger', [undefined, 5])).toBeUndefined();
    expect(formatValueAsNumber('bad', 'toInteger', undefined)).toBeUndefined();
  });
});
