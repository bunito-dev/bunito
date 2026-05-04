import { describe, expect, it } from 'bun:test';
import { ForbiddenException } from './forbidden.exception';

describe('ForbiddenException', () => {
  it('uses the forbidden status code', () => {
    expect(new ForbiddenException().statusCode).toBe(403);
  });
});
