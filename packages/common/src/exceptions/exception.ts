import type { Any, Class } from '../utils';
import type { ExceptionOptions } from './types';

export class Exception<TData = never> extends Error {
  static isInstance<TSelf extends Class<Exception<Any>>>(
    this: TSelf,
    error: unknown,
  ): error is InstanceType<TSelf> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return error instanceof this;
  }

  override message = 'Something went wrong!';

  override name = 'UnknownException';

  readonly data?: TData;

  constructor(optionsLike?: ExceptionOptions<TData> | string, cause?: unknown) {
    super();

    switch (typeof optionsLike) {
      case 'string':
        if (optionsLike) {
          this.message = optionsLike;
        }
        this.cause = cause;
        break;

      case 'object': {
        const { message, data, cause } = optionsLike;

        if (message) {
          this.message = message;
        }

        this.data = data;
        this.cause = cause;
        break;
      }
    }
  }
}
