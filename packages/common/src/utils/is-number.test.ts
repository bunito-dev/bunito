import { describe, expect, it } from 'bun:test';
import { isNumber } from './is-number';

describe('isNumber', () => {
  it('returns true for valid numbers', () => {
    expect(isNumber(0)).toBeTrue();
    expect(isNumber(42)).toBeTrue();
    expect(isNumber(-7)).toBeTrue();
    expect(isNumber(3.14)).toBeTrue();
    expect(isNumber(Infinity)).toBeTrue();
    expect(isNumber(-Infinity)).toBeTrue();
  });

  it('returns false for NaN', () => {
    expect(isNumber(NaN)).toBeFalse();
  });

  it('returns false for non-numbers', () => {
    expect(isNumber('42')).toBeFalse();
    expect(isNumber(null)).toBeFalse();
    expect(isNumber(undefined)).toBeFalse();
    expect(isNumber(true)).toBeFalse();
    expect(isNumber({})).toBeFalse();
  });
});
