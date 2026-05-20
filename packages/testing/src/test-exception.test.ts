import { describe, expect, it } from 'bun:test';
import { AbstractException } from '@bunito/common';
import { TestException } from './test-exception';

describe('TestException', () => {
  it('uses the test exception name and message', () => {
    const error = new TestException('Boom');

    expect(error).toBeInstanceOf(AbstractException);
    expect(error.name).toBe('TestException');
    expect(error.message).toBe('Boom');
  });
});
