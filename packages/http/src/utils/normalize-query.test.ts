import { describe, expect, it } from 'bun:test';
import { normalizeQuery } from './normalize-query';

describe('normalizeQuery', () => {
  it('normalizes repeated query keys into arrays', () => {
    const query = normalizeQuery(new URLSearchParams('tag=a&tag=b&tag=c&page=1'));

    expect(query).toEqual({
      tag: ['a', 'b', 'c'],
      page: '1',
    });
  });
});
