import { describe, expect, it } from 'bun:test';
import { isKebabCase } from './is-kebab-case';

describe('isKebabCase', () => {
  it('accepts only non-empty kebab-case values', () => {
    expect(isKebabCase('api-service')).toBeTrue();
    expect(isKebabCase('ApiService')).toBeFalse();
    expect(isKebabCase('')).toBeFalse();
  });
});
