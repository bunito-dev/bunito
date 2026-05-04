import { describe, expect, it } from 'bun:test';
import { Method } from './method.injection';

describe('Method', () => {
  it('creates a request method injection token', () => {
    expect(Method()).toEqual({
      useToken: Method,
    });
  });
});
