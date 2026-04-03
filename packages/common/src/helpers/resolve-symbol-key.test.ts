import { describe, expect, it } from 'bun:test';
import { resolveSymbolKey } from './resolve-symbol-key';

describe('resolveSymbolKey', () => {
  it('should resolve keys for global and local symbols', () => {
    expect(resolveSymbolKey(Symbol.for('global-token'))).toBe('global-token');
    expect(resolveSymbolKey(Symbol('local-token'))).toBe('local-token');
  });

  it('should return undefined when a symbol has no description', () => {
    expect(resolveSymbolKey(Symbol())).toBeUndefined();
  });
});
