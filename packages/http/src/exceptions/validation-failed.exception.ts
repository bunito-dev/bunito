import type { RawObject } from '@bunito/common';
import type { ZodError } from 'zod';
import { BadRequestException } from './bad-request.exception';

export class ValidationFailedException extends BadRequestException {
  static capture(error: unknown): unknown {
    if (Error.isError(error) && error.name === 'ZodError') {
      const { issues: errors } = error as ZodError;

      return new ValidationFailedException({ errors });
    }

    return error;
  }

  constructor(data?: RawObject) {
    super('Validation Failed', data);
  }
}
