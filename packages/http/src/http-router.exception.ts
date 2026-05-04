import { Exception } from '@bunito/common';

export class HTTPRouterException extends Exception {
  constructor(message?: string, cause?: unknown) {
    super(message, cause);

    this.name = 'HTTPRouterException';
  }
}
