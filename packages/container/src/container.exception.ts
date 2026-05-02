import { Exception } from '@bunito/common';

export class ContainerException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'ContainerException';
  }
}
