import { describe, expect, it } from 'bun:test';
import { Context } from './context';

describe('Context', () => {
  it('creates a broker context injection token', () => {
    expect(Context()).toEqual({
      useToken: Context,
    });
  });
});
