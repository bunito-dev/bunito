import { describe, expect, it } from 'bun:test';
import { isSymbol } from './is-symbol';

describe('isSymbol', () => {
  it('returns true only for symbols', () => {
    expect(isSymbol(Symbol('value'))).toBe(true);
    expect(isSymbol('value')).toBe(false);
    expect(isSymbol(undefined)).toBe(false);
  });
});
