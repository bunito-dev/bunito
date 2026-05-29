import { AbstractException } from '@bunito/common';

export class CLIException extends AbstractException {
  readonly instructions: string[] | undefined;

  constructor(message?: string, ...instructions: string[]) {
    super(message);

    this.name = 'CLIException';

    if (instructions.length) {
      this.instructions = instructions;
    }
  }
}
