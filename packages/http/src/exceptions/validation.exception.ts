import type { ZodError } from 'zod';
import { HttpException } from './http.exception';

export class ValidationException extends HttpException {
  static fromZodError(error: ZodError): ValidationException {
    const { issues } = error;

    return new ValidationException({
      issues,
    });
  }

  override name = 'ValidationException';

  constructor(data: Record<string, unknown> = {}) {
    super('BAD_REQUEST', {
      message: 'Validation failed',
      data,
    });
  }
}
