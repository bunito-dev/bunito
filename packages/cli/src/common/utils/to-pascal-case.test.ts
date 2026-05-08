import { describe, expect, it } from 'bun:test';
import { toPascalCase } from './to-pascal-case';

describe('toPascalCase', () => {
  it('normalizes names into PascalCase identifiers', () => {
    expect(toPascalCase('http-api')).toBe('HttpApi');
    expect(toPascalCase('123-api')).toBe('X123Api');
    expect(toPascalCase('class')).toBe('ClassClass');
    expect(toPascalCase('!!!')).toBe('X');
  });
});
