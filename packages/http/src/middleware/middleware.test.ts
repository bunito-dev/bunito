import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container/internals';
import { Middleware } from './middleware';

describe('Middleware', () => {
  it('registers middleware extensions', () => {
    @Middleware({ injects: ['dependency'] })
    class ExampleMiddleware implements Middleware {
      beforeRequest(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleMiddleware, 'provider')).toEqual({
      decorator: Middleware,
      options: {
        injects: ['dependency'],
      },
    });
  });
});
