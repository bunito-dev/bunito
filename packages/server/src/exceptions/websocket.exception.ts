import { Exception } from '@bunito/common';

export class WebSocketException extends Exception {
  override name = 'WebSocketException';

  constructor(message?: string, cause?: unknown) {
    super(message, cause);
    this.name = 'WebSocketException';
  }
}
