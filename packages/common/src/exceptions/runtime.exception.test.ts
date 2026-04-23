import { describe, expect, it } from 'bun:test';
import { RuntimeException } from './runtime.exception';

describe('RuntimeException', () => {
  it('sets the expected error name', () => {
    expect(new RuntimeException('Runtime').name).toBe('RuntimeException');
  });

  it('throw static method throws RuntimeException', () => {
    expect(() => RuntimeException.throw`Runtime error`).toThrow(RuntimeException);
  });

  it('reject static method rejects with RuntimeException', () => {
    expect(RuntimeException.reject`Runtime error`).rejects.toBeInstanceOf(
      RuntimeException,
    );
  });
});
