import { AbstractException } from '@bunito/common';

export class CLIException extends AbstractException {
  constructor(message?: string) {
    super(message);

    this.name = 'CLIException';
  }
}
