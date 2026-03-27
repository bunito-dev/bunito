import { describe, expect, it } from 'bun:test';
import { ContainerException } from './container.exception';
import { ContainerRuntimeException } from './container-runtime.exception';

describe('ContainerRuntimeException', () => {
  it('should expose the runtime-specific exception name', () => {
    const exception = new ContainerRuntimeException();

    expect(exception.name).toBe('ContainerRuntimeException');
    expect(exception).toBeInstanceOf(ContainerException);
  });
});
