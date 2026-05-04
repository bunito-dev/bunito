import { describe, expect, it } from 'bun:test';
import { BadRequestException } from './bad-request.exception';

describe('BadRequestException', () => {
  it('uses the bad request status code and data payload', () => {
    const error = new BadRequestException('Invalid request', {
      field: 'name',
    });

    expect(error.message).toBe('Invalid request');
    expect(error.statusCode).toBe(400);
    expect(error.toJSON()).toEqual({
      field: 'name',
    });
  });
});
