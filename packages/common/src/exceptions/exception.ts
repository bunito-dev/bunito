import type { Class } from '../utils';

export abstract class Exception<
  TData extends Record<string, unknown> = Record<string, unknown>,
> extends Error {
  static isInstance<TSelf extends Class<Exception>>(
    this: TSelf,
    error: unknown,
  ): error is InstanceType<TSelf> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return error instanceof this;
  }

  override message = 'Unknown Exception';

  override name = 'UnknownException';

  readonly data: Partial<TData> | undefined;

  constructor(message?: string, data?: Partial<TData>, cause?: unknown) {
    super();

    if (message) {
      this.message = message;
    }

    this.data = data;
    this.cause = cause;
  }
}
