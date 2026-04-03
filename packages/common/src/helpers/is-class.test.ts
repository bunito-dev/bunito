import { describe, expect, it } from 'bun:test';
import { isClass } from './is-class';

describe('isClass', () => {
  it('should return true for classes', () => {
    expect(isClass(class TestClass {})).toBeTrue();
  });

  it('should return false for non-class functions', () => {
    expect(
      isClass(function test() {
        return undefined;
      }),
    ).toBeFalse();
    expect(isClass(() => undefined)).toBeFalse();
  });

  it('should return false for non-functions', () => {
    expect(isClass({})).toBeFalse();
    expect(isClass(null)).toBeFalse();
  });
});
