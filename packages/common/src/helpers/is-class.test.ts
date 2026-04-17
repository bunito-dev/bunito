import { describe, expect, it } from 'bun:test';
import { isClass } from './is-class';

describe('isClass', () => {
  it('returns true for classes', () => {
    expect(isClass(class TestClass {})).toBeTrue();
  });

  it('returns false for non-class functions', () => {
    expect(
      isClass(function test() {
        return undefined;
      }),
    ).toBeFalse();
    expect(isClass(() => undefined)).toBeFalse();
  });

  it('returns false for non-functions', () => {
    expect(isClass({})).toBeFalse();
    expect(isClass(null)).toBeFalse();
  });
});
