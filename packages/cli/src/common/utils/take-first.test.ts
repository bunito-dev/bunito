import { describe, expect, it } from 'bun:test';
import { takeFirst } from './take-first';

describe('takeFirst', () => {
  it('returns the first array value or the value itself', () => {
    expect(takeFirst(['one', 'two'])).toBe('one');
    expect(takeFirst('one')).toBe('one');
  });
});
