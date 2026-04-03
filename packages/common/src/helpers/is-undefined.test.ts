import { describe, expect, it } from 'bun:test';
import { isUndefined } from './is-undefined';

describe('isUndefined', () => {
  it('should return true only for undefined', () => {
    expect(isUndefined(undefined)).toBeTrue();
    expect(isUndefined(null)).toBeFalse();
    expect(isUndefined('value')).toBeFalse();
  });
});
