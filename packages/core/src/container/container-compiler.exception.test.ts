import { describe, expect, it } from 'bun:test';
import { ContainerException } from './container.exception';
import { ContainerCompilerException } from './container-compiler.exception';

describe('ContainerCompilerException', () => {
  it('should expose the compiler-specific exception name', () => {
    const exception = new ContainerCompilerException();

    expect(exception.name).toBe('ContainerCompilerException');
    expect(exception).toBeInstanceOf(ContainerException);
  });
});
