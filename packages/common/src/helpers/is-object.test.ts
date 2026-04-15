import { describe, expect, it } from 'bun:test';
import { isObject } from './is-object';

describe('isObject', () => {
  it('returns true for objects', () => {
    expect(isObject({ foo: 'bar' })).toBeTrue();
    expect(isObject([])).toBeTrue();
    expect(isObject(new Date())).toBeTrue();
  });

  it('returns false for non-objects and null', () => {
    expect(isObject(null)).toBeFalse();
    expect(isObject('foo')).toBeFalse();
    expect(isObject(123)).toBeFalse();
    expect(isObject(() => undefined)).toBeFalse();
  });
});
