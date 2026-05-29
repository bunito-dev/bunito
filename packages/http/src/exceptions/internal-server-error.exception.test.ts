import { describe, expect, it } from 'bun:test';
import type { HTTPException } from '../http.exception';
import { BadRequestException } from './bad-request.exception';
import { InternalServerErrorException } from './internal-server-error.exception';

describe('InternalServerErrorException', () => {
  it('uses the internal server error status code', () => {
    expect(new InternalServerErrorException().statusCode).toBe(500);
  });

  it('captures non-HTTP errors and passes HTTP errors through', () => {
    const httpError = new BadRequestException();
    const runtimeError = new Error('Boom');
    const captured = InternalServerErrorException.capture(runtimeError);

    expect(InternalServerErrorException.capture(httpError)).toBe(httpError);
    expect(captured).toBeInstanceOf(InternalServerErrorException);
    expect((captured as HTTPException).cause).toBe(runtimeError);
  });
});
