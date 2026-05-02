import type { Class } from './types';
import { inspectName } from './utils';

export abstract class Exception extends Error {
  static isInstance<TSelf extends Class<Exception>>(
    this: TSelf,
    error: unknown,
  ): error is InstanceType<TSelf> {
    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return error instanceof this;
  }

  static throw<TSelf extends Class<Exception, [message?: string]>>(
    this: TSelf,
    strings: TemplateStringsArray,
    ...args: unknown[]
  ): never {
    const message = String.raw(strings, ...args.map(inspectName));

    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    throw new this(message);
  }

  static reject<TSelf extends Class<Exception, [message?: string]>>(
    this: TSelf,
    strings: TemplateStringsArray,
    ...args: unknown[]
  ): Promise<never> {
    const message = String.raw(strings, ...args.map(inspectName));

    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return Promise.reject(new this(message));
  }

  override message = 'Unknown exception';

  override name = 'UnknownException';

  protected constructor(message?: string, cause?: unknown) {
    super();

    if (message) {
      this.message = message;
    }

    this.cause = cause;
  }
}
