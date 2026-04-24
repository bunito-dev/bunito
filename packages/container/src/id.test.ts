import { describe, expect, it } from 'bun:test';
import { Id } from './id';

describe('Id', () => {
  it('creates stable ids for supported token types', () => {
    class NamedClass {}

    const symbol = Symbol.for('named-token');

    expect(Id.isInstance(Id.for(symbol))).toBe(true);
    expect(Id.for('named-token')).toBe(Id.for('named-token'));
    expect(Id.for(symbol)).toBe(Id.for(symbol));
    expect(Id.for(NamedClass)).toBe(Id.for(NamedClass));
    expect(`${Id.unique('Example')}`).toStartWith('Example#');
  });

  it('rejects empty strings and supports anonymous symbols', () => {
    expect(() => Id.for('')).toThrow('Token must be a non-empty string');
    expect(`${Id.for(Symbol())}`).toStartWith('[symbol]#');
  });
});
