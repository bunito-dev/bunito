import { Exception } from '@bunito/common';

export class ConfigException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'ConfigException';
  }
}
