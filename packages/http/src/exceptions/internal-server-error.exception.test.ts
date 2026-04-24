import { describe, expect, it } from 'bun:test';
import { InternalServerErrorException } from './internal-server-error.exception';

describe('InternalServerErrorException', () => {
  it('creates a 500 HTTP exception', () => {
    expect(new InternalServerErrorException().status).toBe(500);
  });
});
