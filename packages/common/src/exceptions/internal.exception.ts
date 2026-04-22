import type { Class } from '../utils';
import { inspectName } from '../utils';
import { Exception } from './exception';

export class InternalException extends Exception {
  static throw<TSelf extends Class<InternalException, [message?: string]>>(
    this: TSelf,
    strings: TemplateStringsArray,
    ...args: unknown[]
  ): never {
    const message = String.raw(strings, ...args.map(inspectName));

    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    throw new this(message);
  }

  static reject<TSelf extends Class<InternalException, [message?: string]>>(
    this: TSelf,
    strings: TemplateStringsArray,
    ...args: unknown[]
  ): Promise<never> {
    const message = String.raw(strings, ...args.map(inspectName));

    // biome-ignore lint/complexity/noThisInStatic: Need to use `this`
    return Promise.reject(new this(message));
  }

  override name = 'InternalException';
}
