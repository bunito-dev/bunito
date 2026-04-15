import { describe, expect, it } from 'bun:test';
import { normalizeSearchParams } from './normalize-search-params';

describe('normalizeSearchParams', () => {
  it('collects repeated params into arrays and keeps single values as strings', () => {
    expect(
      normalizeSearchParams(new URLSearchParams('tag=a&tag=b&tag=c&single=value')),
    ).toEqual({
      tag: ['a', 'b', 'c'],
      single: 'value',
    });
  });
});
