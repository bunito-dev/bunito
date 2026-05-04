import { describe, expect, it } from 'bun:test';
import { normalizePath } from './normalize-path';

describe('normalizePath', () => {
  it('joins path segments while ignoring root and undefined values', () => {
    expect(normalizePath()).toBe('/');
    expect(normalizePath('/', undefined)).toBe('/');
    expect(normalizePath('/api', '/', '/users')).toBe('/api/users');
  });
});
