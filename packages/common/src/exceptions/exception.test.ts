import { describe, expect, it } from 'bun:test';
import { RuntimeException } from './runtime.exception';

describe('Exception', () => {
  it('has default message and name', () => {
    const error = new RuntimeException();
    expect(error.message).toBe('Unknown Exception');
    expect(error.name).toBe('RuntimeException');
    expect(error).toBeInstanceOf(Error);
  });

  it('sets message when provided', () => {
    const error = new RuntimeException('Something went wrong');
    expect(error.message).toBe('Something went wrong');
  });

  it('sets cause when provided', () => {
    const cause = new Error('root cause');
    const error = new RuntimeException(undefined, cause);
    expect(error.cause).toBe(cause);
  });

  it('isInstance returns true for matching subclass', () => {
    const error = new RuntimeException('msg');
    expect(RuntimeException.isInstance(error)).toBe(true);
  });

  it('isInstance returns false for non-matching values', () => {
    expect(RuntimeException.isInstance(new Error('plain'))).toBe(false);
    expect(RuntimeException.isInstance(null)).toBe(false);
    expect(RuntimeException.isInstance('string')).toBe(false);
  });
});
