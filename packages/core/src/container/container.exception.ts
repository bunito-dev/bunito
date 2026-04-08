import { Exception } from '@bunito/common';

export class ContainerException extends Exception {
  // biome-ignore lint/complexity/noUselessConstructor: Explicit constructor keeps Bun function coverage accurate
  constructor(
    message?: string | undefined,
    data?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(message, data, cause);
  }

  override name = 'ContainerException';
}
