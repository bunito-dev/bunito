import { describe, expect, it } from 'bun:test';
import { isFn } from './is-fn';

describe('isFn', () => {
  it('returns true for callable values', () => {
    expect(isFn(function test() {})).toBeTrue();
    expect(isFn(() => undefined)).toBeTrue();
    expect(isFn(class TestClass {})).toBeTrue();
  });

  it('returns false for non-callable values', () => {
    expect(isFn({})).toBeFalse();
    expect(isFn(null)).toBeFalse();
    expect(isFn('test')).toBeFalse();
  });
});
