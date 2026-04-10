import { describe, expect, it } from 'bun:test';
import { normalizeSearchParams, processTokenizedPath, tokenizePath } from './index';

describe('routing utils', () => {
  it('should tokenize paths and normalize route segments', () => {
    expect(tokenizePath('/api', '/users/:id', undefined, '/')).toEqual([
      'api',
      'users',
      ':id',
    ]);
    expect(processTokenizedPath('users', ':id', '*', '**')).toEqual([
      { kind: 'static', value: 'users' },
      { kind: 'param', name: 'id' },
      { kind: 'any' },
      { kind: 'wildcard' },
    ]);
  });

  it('should normalize query strings into string or string arrays', () => {
    const params = new URLSearchParams([
      ['q', 'one'],
      ['q', 'two'],
      ['q', 'three'],
      ['page', '1'],
    ]);

    expect(normalizeSearchParams(params)).toEqual({
      q: ['one', 'two', 'three'],
      page: '1',
    });
  });
});
