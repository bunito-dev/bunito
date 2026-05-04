import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import type { HTTPException } from '../http.exception';
import { BadRequestException } from './bad-request.exception';
import { ForbiddenException } from './forbidden.exception';
import { InternalServerErrorException } from './internal-server-error.exception';
import { NotFoundException } from './not-found.exception';
import { NotImplementedException } from './not-implemented.exception';
import { UnauthorizedException } from './unauthorized.exception';
import { ValidationFailedException } from './validation-failed.exception';

describe('HTTP exceptions', () => {
  it('maps specific exceptions to HTTP status codes', () => {
    expect(new BadRequestException().statusCode).toBe(400);
    expect(new UnauthorizedException().statusCode).toBe(401);
    expect(new ForbiddenException().statusCode).toBe(403);
    expect(new NotFoundException().statusCode).toBe(404);
    expect(new InternalServerErrorException().statusCode).toBe(500);
    expect(new NotImplementedException().statusCode).toBe(501);
  });

  it('captures non-HTTP errors as internal server errors', () => {
    const httpError = new BadRequestException();
    const runtimeError = new Error('Boom');
    const captured = InternalServerErrorException.capture(runtimeError);

    expect(InternalServerErrorException.capture(httpError)).toBe(httpError);
    expect(captured).toBeInstanceOf(InternalServerErrorException);
    expect((captured as HTTPException).cause).toBe(runtimeError);
  });

  it('captures Zod errors as validation failures', () => {
    const result = z.object({ id: z.string() }).safeParse({
      id: 123,
    });

    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    const captured = ValidationFailedException.capture(result.error);
    const passthrough = ValidationFailedException.capture(new Error('Boom'));

    expect(captured).toBeInstanceOf(ValidationFailedException);
    expect((captured as HTTPException).toJSON()).toEqual({
      errors: result.error.issues,
    });
    expect(passthrough).toBeInstanceOf(Error);
  });
});
