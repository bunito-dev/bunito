import { describe, expect, it } from 'bun:test';
import { isNull } from './is-null';

describe('isNull', () => {
  it('should return true only for null', () => {
    expect(isNull(null)).toBeTrue();
    expect(isNull(undefined)).toBeFalse();
    expect(isNull(0)).toBeFalse();
  });
});
