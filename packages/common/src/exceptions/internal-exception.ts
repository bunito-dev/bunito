import { AbstractException } from './abstract-exception';

export class InternalException extends AbstractException {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'InternalException';
  }
}
