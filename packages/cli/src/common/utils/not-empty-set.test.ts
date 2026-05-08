import { describe, expect, it } from 'bun:test';
import { notEmptySet } from './not-empty-set';

describe('notEmptySet', () => {
  it('returns a set for non-empty arrays and null otherwise', () => {
    expect(notEmptySet(['api', 'api', 'admin'])).toEqual(new Set(['api', 'admin']));
    expect(notEmptySet([])).toBeNull();
  });
});
