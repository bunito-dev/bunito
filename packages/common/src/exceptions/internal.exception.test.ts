import { describe, expect, it } from 'bun:test';
import { InternalException } from './internal.exception';

describe('InternalException', () => {
  it('sets the expected error name', () => {
    expect(new InternalException('Internal').name).toBe('InternalException');
  });

  it('throw static method throws with template literal message', () => {
    expect(() => InternalException.throw`Something failed`).toThrow(InternalException);
    expect(() => InternalException.throw`Something failed`).toThrow('Something failed');
  });

  it('throw static method interpolates arguments via inspectName', () => {
    const value = 'myValue';
    expect(() => InternalException.throw`Got: ${value}`).toThrow('Got: myValue');
  });

  it('reject static method returns rejected promise with InternalException', () => {
    expect(InternalException.reject`Something failed`).rejects.toBeInstanceOf(
      InternalException,
    );
    expect(InternalException.reject`Something failed`).rejects.toMatchObject({
      message: 'Something failed',
    });
  });
});
