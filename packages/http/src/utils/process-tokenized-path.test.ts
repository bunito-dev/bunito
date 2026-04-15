import { describe, expect, it } from 'bun:test';
import { processTokenizedPath } from './process-tokenized-path';

describe('processTokenizedPath', () => {
  it('maps static, parameter and wildcard segments into route descriptors', () => {
    expect(processTokenizedPath('users', ':id', '*', '**')).toEqual([
      { kind: 'static', value: 'users' },
      { kind: 'param', name: 'id' },
      { kind: 'any' },
      { kind: 'wildcard' },
    ]);
  });
});
