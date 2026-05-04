import { describe, expect, it } from 'bun:test';
import { Context } from './context.injection';

describe('Context', () => {
  it('creates a request context injection token', () => {
    expect(Context()).toEqual({
      useToken: Context,
    });
  });
});
