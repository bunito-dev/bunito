import { Exception } from '@bunito/common';

export class SecretsException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);
    this.name = 'SecretsException';
  }
}
