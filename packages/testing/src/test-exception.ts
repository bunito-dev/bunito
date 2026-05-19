import { AbstractException } from '@bunito/common';

export class TestException extends AbstractException {
  constructor(message?: string) {
    super(message);

    this.name = 'TestException';
  }
}
