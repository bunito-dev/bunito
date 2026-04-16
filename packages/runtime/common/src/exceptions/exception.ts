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

  static reject<TSelf extends Class<Exception>>(
    this: TSelf,
    message?: string | undefined,
    data?: Record<string, unknown>,
    cause?: unknown,
  ): Promise<never> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return Promise.reject(new this(message, data, cause));
  }

  static capture(err: unknown): Exception {
    if (Exception.isInstance(err)) {
      return err;
    }

    if (Error.isError(err)) {
      return new Exception(err.message, undefined, err);
    }

    if (isString(err)) {
      return new Exception(err);
    }

    return new Exception(undefined, undefined, err);
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
