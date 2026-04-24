import { describe, expect, it } from 'bun:test';
import { ForbiddenException } from './forbidden.exception';

describe('ForbiddenException', () => {
  it('creates a 403 HTTP exception', () => {
    expect(new ForbiddenException().status).toBe(403);
  });
});
