import { Exception } from '@bunito/common';

export class LoggerException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'LoggerException';
  }
}
