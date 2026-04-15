import { describe, expect, it } from 'bun:test';
import { tokenizePath } from './tokenize-path';

describe('tokenizePath', () => {
  it('splits and flattens path fragments into route tokens', () => {
    expect(tokenizePath('/api', '/users/:id')).toEqual(['api', 'users', ':id']);
    expect(tokenizePath(undefined, '/', '/health')).toEqual(['health']);
  });
});
