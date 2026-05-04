import { describe, expect, it } from 'bun:test';
import { getProviderMetadata } from '@bunito/container/internals';
import { Middleware } from './middleware';

describe('Middleware', () => {
  it('registers middleware extensions', () => {
    @Middleware({ injects: ['dependency'] })
    class ExampleMiddleware implements Middleware {
      beforeRequest(): void {
        //
      }
    }

    expect(getProviderMetadata(ExampleMiddleware)).toEqual({
      decorator: Middleware,
      options: {
        injects: ['dependency'],
      },
    });
  });
});
