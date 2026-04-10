import { describe, expect, it } from 'bun:test';
import { notEmpty } from './not-empty';

describe('notEmpty', () => {
  it('should return true for non-empty defined values', () => {
    expect(notEmpty(0)).toBeTrue();
    expect(notEmpty(false)).toBeTrue();
    expect(notEmpty({})).toBeTrue();
    expect(notEmpty([1])).toBeTrue();
  });

  it('should return false for empty values', () => {
    expect(notEmpty('')).toBeFalse();
    expect(notEmpty([])).toBeFalse();
    expect(notEmpty(null)).toBeFalse();
    expect(notEmpty(undefined)).toBeFalse();
  });
});
