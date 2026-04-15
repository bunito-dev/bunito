import { describe, expect, it } from 'bun:test';
import { isString } from './is-string';

describe('isString', () => {
  it('returns true only for string primitives', () => {
    expect(isString('value')).toBeTrue();
    expect(isString('')).toBeTrue();
    expect(isString('', false)).toBeFalse();
    expect(isString(String('wrapped'))).toBeTrue();
    expect(isString(123)).toBeFalse();
    expect(isString(false)).toBeFalse();
    expect(isString(null)).toBeFalse();
    expect(isString(undefined)).toBeFalse();
    expect(isString({})).toBeFalse();
  });
});
