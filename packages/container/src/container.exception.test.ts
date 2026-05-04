import { describe, expect, it } from 'bun:test';
import { ContainerException } from './container.exception';

describe('ContainerException', () => {
  it('uses a container-specific exception name', () => {
    const cause = new Error('Cause');
    const error = new ContainerException('Container failed', cause);

    expect(error.name).toBe('ContainerException');
    expect(error.message).toBe('Container failed');
    expect(error.cause).toBe(cause);
  });
});
