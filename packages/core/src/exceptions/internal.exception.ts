import { Exception } from '@bunito/common';

export class InternalException extends Exception {
  constructor(
    message?: string | undefined,
    data?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, data, cause);

    this.name = 'InternalException';
  }
}
