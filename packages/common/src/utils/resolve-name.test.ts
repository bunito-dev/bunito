import { describe, expect, it } from 'bun:test';
import { resolveName } from './resolve-name';

describe('resolveName', () => {
  it('should return the original string for string values', () => {
    expect(resolveName('test-name')).toBe('test-name');
  });

  it('should resolve names for function values', () => {
    function namedFunction() {
      return undefined;
    }

    expect(resolveName(namedFunction)).toBe('namedFunction');
    expect(resolveName(() => undefined)).toBe('arrow');
    expect(resolveName(class {})).toBe('anonymous');
  });

  it('should resolve names for object-like values', () => {
    expect(resolveName([])).toBe('Array');
    expect(resolveName({})).toBe('Object');
    expect(resolveName(null)).toBe('null');
  });

  it('should resolve names for symbols', () => {
    const globalSymbol = Symbol.for('global-token');

    expect(resolveName(globalSymbol)).toBe('global-token');
    expect(resolveName(Symbol('local-token'))).toBe('local-token');
  });

  it('should fall back to typeof for primitive values without names', () => {
    expect(resolveName(undefined)).toBe('undefined');
    expect(resolveName(123)).toBe('number');
    expect(resolveName(true)).toBe('boolean');
  });
});
