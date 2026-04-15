import { describe, expect, it } from 'bun:test';
import { resolveObjectName } from './resolve-object-name';

describe('resolveObjectName', () => {
  it('resolves names for function values', () => {
    function namedFunction() {
      return undefined;
    }

    class NamedClass {}

    expect(resolveObjectName(namedFunction)).toBe('namedFunction');
    expect(resolveObjectName(NamedClass)).toBe('NamedClass');
  });

  it('resolves constructor names for object instances', () => {
    expect(resolveObjectName([])).toBe('Array');
    expect(resolveObjectName(new Date())).toBe('Date');
  });

  it('returns undefined for anonymous functions without names', () => {
    const anonymousFn = Object.defineProperty(() => undefined, 'name', {
      value: '',
      configurable: true,
    }) as () => void;

    expect(resolveObjectName({})).toBeUndefined();
    expect(resolveObjectName(anonymousFn)).toBeUndefined();
  });
});
