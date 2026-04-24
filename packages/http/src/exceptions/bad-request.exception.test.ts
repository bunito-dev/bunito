import { describe, expect, it } from 'bun:test';
import { BadRequestException } from './bad-request.exception';

describe('BadRequestException', () => {
  it('creates a 400 HTTP exception with optional data', () => {
    const exception = new BadRequestException('Invalid', { field: 'name' });

    expect(exception.status).toBe(400);
    expect(exception.message).toBe('Invalid');
    expect(exception.data).toEqual({ field: 'name' });
  });
});
