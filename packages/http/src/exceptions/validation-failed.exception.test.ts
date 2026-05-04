import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import type { HTTPException } from '../http.exception';
import { ValidationFailedException } from './validation-failed.exception';

describe('ValidationFailedException', () => {
  it('uses the validation failure payload', () => {
    const error = new ValidationFailedException({
      errors: ['Invalid'],
    });

    expect(error.message).toBe('Validation Failed');
    expect(error.statusCode).toBe(400);
    expect(error.toJSON()).toEqual({
      errors: ['Invalid'],
    });
  });

  it('captures Zod errors and passes other errors through', () => {
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
