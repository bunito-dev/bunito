import type { ExceptionOptions } from '@bunito/common';
import { Exception } from '@bunito/common';

export class ContainerException<TData = never> extends Exception<TData> {
  // biome-ignore lint/complexity/noUselessConstructor: Explicit constructor keeps Bun function coverage accurate
  constructor(optionsLike?: ExceptionOptions<TData> | string, cause?: unknown) {
    super(optionsLike, cause);
  }

  override name = 'ContainerException';
}
