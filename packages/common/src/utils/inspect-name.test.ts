import { describe, expect, it } from 'bun:test';
import { inspectName } from './inspect-name';

describe('inspectName', () => {
  describe('symbol', () => {
    it('returns the key for registered symbols', () => {
      expect(inspectName(Symbol.for('myKey'))).toBe('myKey');
    });

    it('returns the description for local symbols', () => {
      expect(inspectName(Symbol('named'))).toBe('named');
    });

    it('returns [symbol] for anonymous symbols', () => {
      expect(inspectName(Symbol())).toBe('[symbol]');
    });
  });

  describe('function', () => {
    it('returns the function name', () => {
      expect(inspectName(function myFn() {})).toBe('myFn');
    });

    it('returns [fn (anonymous)] for anonymous functions', () => {
      expect(inspectName(() => undefined)).toBe('[fn (anonymous)]');
    });

    it('returns the class name', () => {
      expect(inspectName(class MyClass {})).toBe('MyClass');
    });
  });

  describe('object', () => {
    it('returns [null] for null', () => {
      expect(inspectName(null)).toBe('[null]');
    });

    it('returns [empty] for empty arrays', () => {
      expect(inspectName([])).toBe('[empty]');
    });

    it('joins array elements with arrow for non-empty arrays', () => {
      expect(inspectName(['a', 'b', 'c'])).toBe('a → b → c');
    });

    it('returns constructor name for class instances', () => {
      expect(inspectName(new Date())).toBe('Date');
    });

    it('returns [object (anonymous)] for plain objects', () => {
      expect(inspectName({})).toBe('[object (anonymous)]');
    });

    it('falls back to Bun.inspect for objects with custom inspector', () => {
      const obj = { [Bun.inspect.custom]: () => 'custom' };
      const result = inspectName(obj);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('string', () => {
    it('returns the string value for non-empty strings', () => {
      expect(inspectName('hello')).toBe('hello');
    });

    it('returns [string] for empty strings', () => {
      expect(inspectName('')).toBe('[string]');
    });
  });

  describe('fallback', () => {
    it('uses Bun.inspect for other types', () => {
      expect(inspectName(42)).toBe(
        Bun.inspect(42, { compact: true, depth: 1, colors: false }),
      );
      expect(inspectName(undefined)).toBe(
        Bun.inspect(undefined, { compact: true, depth: 1, colors: false }),
      );
    });
  });
});
