import { describe, expect, it } from 'bun:test';
import { toKebabCase } from './to-kebab-case';

describe('toKebabCase', () => {
  it('normalizes names into kebab-case identifiers', () => {
    expect(toKebabCase('HTTP API')).toBe('http-api');
    expect(toKebabCase('123 API')).toBe('x-123-api');
    expect(toKebabCase('!!!')).toBe('item');
  });
});
