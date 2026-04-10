import { describe, expect, it } from 'bun:test';
import { EMPTY_MAP, NestedMap } from './index';

describe('NestedMap', () => {
  it('should initialize from nested entries', () => {
    const map = new NestedMap([
      ['foo', [['bar', 1]]],
      ['baz', [['qux', 2]]],
    ]);

    expect(map.has('foo')).toBeTrue();
    expect(map.has('foo', 'bar')).toBeTrue();
    expect(map.get('foo', 'bar')).toBe(1);
    expect([...map.keys()]).toEqual(['foo', 'baz']);
    expect([...map.keys('foo')]).toEqual(['bar']);
    expect([...map.values('baz')]).toEqual([2]);
    expect([...map.entries('baz')]).toEqual([['qux', 2]]);
  });

  it('should create nested maps on demand and support deletes', () => {
    const map = new NestedMap<string, string, number>();

    expect(map.set('foo', 'bar', 1)).toBe(map);
    expect(map.set('foo', 'baz', 2)).toBe(map);
    expect(map.delete('foo', 'bar')).toBeTrue();
    expect(map.has('foo', 'bar')).toBeFalse();
    expect(map.delete('foo')).toBeTrue();
    expect(map.has('foo')).toBeFalse();
  });

  it('should return empty iterators for missing keys', () => {
    const map = new NestedMap<string, string, number>();

    expect(map.delete('foo', 'bar')).toBeFalse();
    expect([...map.keys('foo')]).toEqual([...EMPTY_MAP.keys()]);
    expect([...map.values('foo')]).toEqual([...EMPTY_MAP.values()]);
    expect([...map.entries('foo')]).toEqual([]);
  });
});
