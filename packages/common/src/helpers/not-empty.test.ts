import { describe, expect, it } from 'bun:test';
import { notEmpty } from './not-empty';

describe('notEmpty', () => {
  it('returns true for non-empty defined values', () => {
    expect(notEmpty(0)).toBeTrue();
    expect(notEmpty(false)).toBeTrue();
    expect(notEmpty({})).toBeTrue();
    expect(notEmpty([1])).toBeTrue();
  });

  it('returns false for empty values', () => {
    expect(notEmpty('')).toBeFalse();
    expect(notEmpty([])).toBeFalse();
    expect(notEmpty(null)).toBeFalse();
    expect(notEmpty(undefined)).toBeFalse();
  });
});
