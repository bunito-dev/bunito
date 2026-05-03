import { describe, expect, it } from 'bun:test';
import { getProviderMetadata } from '@bunito/container/internals';
import { ServerRouter } from './server-router';

describe('ServerRouter', () => {
  it('registers singleton server router extensions by default', () => {
    @ServerRouter({ injects: ['dependency'] })
    class ExampleRouter implements ServerRouter {
      processRequest(): Response {
        return new Response('ok');
      }
    }

    expect(getProviderMetadata(ExampleRouter)).toEqual({
      decorator: ServerRouter,
      options: {
        injects: ['dependency'],
      },
    });
  });
});
