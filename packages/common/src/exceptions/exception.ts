import type { Class } from '../helpers';

export class Exception extends Error {
  static isInstance<TSelf extends Class<Exception>>(
    this: TSelf,
    error: unknown,
  ): error is InstanceType<TSelf> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return error instanceof this;
  }

  override message = 'Something went wrong!';

  override name = 'UnknownException';

  readonly data?: Record<string, unknown>;

  constructor(message?: string, data?: Record<string, unknown>, cause?: unknown) {
    super();

    if (message) {
      this.message = message;
    }

    this.cause = cause;
    this.data = data;
  }
}
