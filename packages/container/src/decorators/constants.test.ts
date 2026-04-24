import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from './constants';

describe('DECORATOR_METADATA_KEYS', () => {
  it('exposes unique metadata symbols', () => {
    expect(DECORATOR_METADATA_KEYS.classOptions).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.classProps).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.components).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.extension).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.module).toBeSymbol();
    expect(DECORATOR_METADATA_KEYS.provider).toBeSymbol();
    expect(new Set(Object.values(DECORATOR_METADATA_KEYS)).size).toBe(
      Object.keys(DECORATOR_METADATA_KEYS).length,
    );
  });
});
