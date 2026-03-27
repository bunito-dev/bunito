import { describe, expect, it } from 'bun:test';
import { optional } from './optional';

describe('optional', () => {
  it('should wrap a token as an optional injection', () => {
    const token = Symbol('token');

    expect(optional(token)).toEqual({
      optional: true,
      token,
    });
  });
});
