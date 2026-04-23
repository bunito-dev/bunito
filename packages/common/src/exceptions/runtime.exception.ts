import { InternalException } from './internal.exception';

export class RuntimeException extends InternalException {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'RuntimeException';
  }
}
