import { describe, expect, it } from 'bun:test';
import { normalizePath } from './normalize-path';

describe('normalizePath', () => {
  it('should normalize and join path segments', () => {
    expect(normalizePath('/api', '/users')).toBe('/api/users');
    expect(normalizePath('api/', '/users/', '/:id')).toBe('/api/users/:id');
  });

  it('should ignore empty path segments', () => {
    expect(normalizePath(undefined, '', '/', '/users')).toBe('/users');
    expect(normalizePath()).toBe('/');
  });
});
