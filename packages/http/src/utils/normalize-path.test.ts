import { describe, expect, it } from 'bun:test';
import { normalizePath } from './normalize-path';

describe('normalizePath', () => {
  it('joins path parts into a normalized absolute path', () => {
    expect(normalizePath('/api/', undefined, '/users', '1/')).toBe('/api/users/1');
    expect(normalizePath()).toBe('/');
  });
});
