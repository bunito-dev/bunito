import type { Class } from '../utils';

export abstract class Exception extends Error {
  static isInstance<TSelf extends Class<Exception>>(
    this: TSelf,
    error: unknown,
  ): error is InstanceType<TSelf> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return error instanceof this;
  }

  override message = 'Unknown Exception';

  override name = 'UnknownException';

  constructor(message?: string, cause?: unknown) {
    super();

    if (message) {
      this.message = message;
    }

    this.cause = cause;
  }
}
