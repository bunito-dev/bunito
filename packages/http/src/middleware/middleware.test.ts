import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { MIDDLEWARE_EXTENSION } from '../constants';
import { Middleware } from './middleware';

describe('Middleware', () => {
  it('registers a middleware extension', () => {
    @Middleware({
      injects: ['dependency'],
    })
    class TestMiddleware {}

    expect(getDecoratorMetadata(TestMiddleware, 'extension')).toEqual({
      key: MIDDLEWARE_EXTENSION,
      options: undefined,
    });
    expect(getDecoratorMetadata(TestMiddleware, 'provider')).toEqual({
      options: {
        injects: ['dependency'],
      },
    });
  });
});
