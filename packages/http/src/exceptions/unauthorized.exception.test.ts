import { describe, expect, it } from 'bun:test';
import { UnauthorizedException } from './unauthorized.exception';

describe('UnauthorizedException', () => {
  it('creates a 401 HTTP exception', () => {
    expect(new UnauthorizedException().status).toBe(401);
  });
});
