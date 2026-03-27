import { describe, expect, it } from 'bun:test';
import { ContainerException } from './container.exception';

describe('ContainerException', () => {
  it('should expose the container-specific exception name', () => {
    const exception = new ContainerException();

    expect(exception.name).toBe('ContainerException');
    expect(exception).toBeInstanceOf(Error);
  });
});
