import { describe, expect, it } from 'bun:test';
import { notEmpty } from './not-empty';

describe('notEmpty', () => {
  it('should return true for defined values', () => {
    expect(notEmpty(0)).toBeTrue();
    expect(notEmpty('')).toBeTrue();
    expect(notEmpty(false)).toBeTrue();
    expect(notEmpty({})).toBeTrue();
  });

  it('should return false for nullish values', () => {
    expect(notEmpty(null)).toBeFalse();
    expect(notEmpty(undefined)).toBeFalse();
  });
});
