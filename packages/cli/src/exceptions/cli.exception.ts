import { Exception } from '@bunito/common';

export class CliException extends Exception {
  constructor(message: string) {
    super(message);

    this.name = 'CliException';
  }
}
