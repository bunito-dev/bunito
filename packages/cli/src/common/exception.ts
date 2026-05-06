export class Exception extends Error {
  readonly args: string[];

  constructor(message: string, ...args: string[]) {
    super(message);

    this.args = args;
  }
}
