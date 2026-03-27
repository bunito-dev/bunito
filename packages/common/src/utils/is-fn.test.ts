import { describe, expect, it } from 'bun:test';
import { isFn } from './is-fn';

describe('isFn', () => {
  it('should return true for callable values', () => {
    expect(isFn(function test() {})).toBeTrue();
    expect(isFn(() => undefined)).toBeTrue();
    expect(isFn(class TestClass {})).toBeTrue();
  });

  it('should return false for non-callable values', () => {
    expect(isFn({})).toBeFalse();
    expect(isFn(null)).toBeFalse();
    expect(isFn('test')).toBeFalse();
  });
});
