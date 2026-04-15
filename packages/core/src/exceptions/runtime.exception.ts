import { InternalException } from './internal.exception';

export class RuntimeException extends InternalException {
  constructor(message: string, data?: Record<string, unknown>, cause?: unknown) {
    super(message, data, cause);

    this.name = 'RuntimeException';
  }
}
