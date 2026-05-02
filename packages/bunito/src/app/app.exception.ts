import { Exception } from '@bunito/common';

export class AppException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'AppException';
  }
}
