import { describe, expect, it } from 'bun:test';
import { Id } from './id';

describe('Id', () => {
  it('creates stable ids for supported token types', () => {
    class NamedClass {}

    const objectToken = { name: 'token' };
    const localSymbol = Symbol('local');
    const globalSymbol = Symbol.for('shared');
    const stringId = Id.for('shared');

    expect(Id.isInstance(stringId)).toBe(true);
    expect(Id.for(stringId)).toBe(stringId);
    expect(Id.for({ token: stringId })).toBe(stringId);
    expect(Id.for('shared')).toBe(stringId);
    expect(Id.for(globalSymbol)).toBe(stringId);
    expect(Id.for(localSymbol)).toBe(Id.for(localSymbol));
    expect(Id.for(objectToken)).toBe(Id.for(objectToken));
    expect(Id.for(NamedClass)).toBe(Id.for(NamedClass));
    expect(`${Id.unique('Example')}`).toStartWith('Example#');
    expect(new Id('Manual').toString()).toBe('Manual');
    expect(Bun.inspect(new Id('Manual'))).toBe('Manual');
  });

  it('rejects empty string tokens and names anonymous symbols', () => {
    expect(() => Id.for('')).toThrow('Token must be a non-empty string');
    expect(`${Id.for(Symbol())}`).toStartWith('[symbol]#');
  });
});
