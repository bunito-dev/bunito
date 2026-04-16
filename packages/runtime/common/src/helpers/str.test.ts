import { describe, expect, it } from 'bun:test';
import { str } from './str';

describe('str', () => {
  it('stringifies primitive values', () => {
    expect(str`value ${'text'} ${12} ${123n} ${true} ${false} ${null}`).toBe(
      'value text 12 123 true false null',
    );
  });

  it('stringifies symbols, named callables and objects', () => {
    class NamedClass {}

    function namedFn() {
      return undefined;
    }

    expect(
      str`items ${Symbol.for('shared')} ${Symbol('local')} ${NamedClass} ${namedFn} ${{
        toString() {
          return '[object CustomObject]';
        },
      }} ${{
        toString() {
          return 'custom-value';
        },
      }}`,
    ).toBe('items shared local NamedClass namedFn [object] custom-value');
  });

  it('falls back for anonymous symbols, callables and objects with plain tags', () => {
    const anonymousClass = Object.defineProperty(class {}, 'name', {
      value: '',
      configurable: true,
    });
    const anonymousFn = Object.defineProperty(() => undefined, 'name', {
      value: '',
      configurable: true,
    });

    expect(
      str`items ${Symbol()} ${anonymousClass} ${anonymousFn} ${{
        toString() {
          return '[object Object]';
        },
      }} ${undefined}`,
    ).toBe('items [symbol] [class] [fn] [object] ');
  });

  it('stringifies arrays using the dedicated fallback label', () => {
    expect(str`items ${[1, 2, 3]}`).toBe('items [array]');
  });
});
