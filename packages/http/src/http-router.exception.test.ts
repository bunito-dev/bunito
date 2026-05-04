import { describe, expect, it } from 'bun:test';
import { HTTPRouterException } from './http-router.exception';

describe('HTTPRouterException', () => {
  it('uses an HTTP-router-specific exception name', () => {
    const error = new HTTPRouterException('Invalid router');

    expect(error.name).toBe('HTTPRouterException');
    expect(error.message).toBe('Invalid router');
  });
});
