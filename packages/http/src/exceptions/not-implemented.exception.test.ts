import { describe, expect, it } from 'bun:test';
import { NotImplementedException } from './not-implemented.exception';

describe('NotImplementedException', () => {
  it('uses the not implemented status code', () => {
    expect(new NotImplementedException().statusCode).toBe(501);
  });
});
