import { describe, expect, it } from 'bun:test';
import { AbstractException } from './abstract-exception';
import { InternalException } from './internal-exception';

describe('InternalException', () => {
  it('uses the internal exception name', () => {
    const cause = new Error('cause');
    const exception = new InternalException('Boom', cause);

    expect(exception).toBeInstanceOf(AbstractException);
    expect(exception.name).toBe('InternalException');
    expect(exception.message).toBe('Boom');
    expect(exception.cause).toBe(cause);
  });
});
