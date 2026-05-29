import { describe, expect, it } from 'bun:test';
import { UnauthorizedException } from './unauthorized.exception';

describe('UnauthorizedException', () => {
  it('uses the unauthorized status code', () => {
    expect(new UnauthorizedException().statusCode).toBe(401);
  });
});
