import { Exception } from './exception';

export class InternalException extends Exception {
  constructor(message: string, data?: Record<string, unknown>, cause?: unknown) {
    super(message, data, cause);

    this.name = 'InternalException';
  }
}
