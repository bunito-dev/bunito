import type { Class } from '../helpers';
import { isString } from '../helpers';

export class Exception extends Error {
  static isInstance<TSelf extends Class<Exception>>(
    this: TSelf,
    error: unknown,
  ): error is InstanceType<TSelf> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return error instanceof this;
  }

  override message = 'Unknown Exception';

  override name = 'UnknownException';

  readonly data: Record<string, unknown> | undefined;

  constructor(
    message?: string | undefined,
    data?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super();

    if (isString(message, false)) {
      this.message = message;
    }

    this.data = data;
    this.cause = cause;
  }
}
