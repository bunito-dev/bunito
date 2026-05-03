import { describe, expect, it } from 'bun:test';
import { isNullish } from './is-nullish';

describe('isNullish', () => {
  it('returns true for null and undefined', () => {
    expect(isNullish(undefined)).toBeTrue();
    expect(isNullish(null)).toBeTrue();
  });

  it('returns false for non-nullish values', () => {
    expect(isNullish('42')).toBeFalse();
    expect(isNullish(true)).toBeFalse();
    expect(isNullish({})).toBeFalse();
  });
});
