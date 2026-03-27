import { ContainerException } from './container.exception';

export class ContainerRuntimeException extends ContainerException<unknown> {
  // biome-ignore lint/complexity/noUselessConstructor: Explicit constructor keeps Bun function coverage accurate
  constructor(
    optionsLike?: ConstructorParameters<typeof ContainerException>[0],
    cause?: unknown,
  ) {
    super(optionsLike, cause);
  }

  override name = 'ContainerRuntimeException';
}
