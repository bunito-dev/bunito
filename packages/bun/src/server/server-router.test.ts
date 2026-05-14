import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { ServerRouter } from './server-router';

describe('ServerRouter', () => {
  it('registers singleton server router extensions by default', () => {
    @ServerRouter({ injects: ['dependency'] })
    class ExampleRouter implements ServerRouter {
      processRequest(): Response {
        return new Response('ok');
      }
    }

    expect(getClassMetadata(ExampleRouter, 'provider')).toEqual({
      decorator: ServerRouter,
      options: {
        injects: ['dependency'],
      },
    });
  });
});
