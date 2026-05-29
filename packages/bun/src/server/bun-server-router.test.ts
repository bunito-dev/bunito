import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { BunServerRouter } from './bun-server-router';

describe('ServerRouter', () => {
  it('registers singleton server router extensions by default', () => {
    @BunServerRouter({ injects: ['dependency'] })
    class ExampleRouter implements BunServerRouter {
      processRequest(): Response {
        return new Response('ok');
      }
    }

    expect(getClassMetadata(ExampleRouter, 'provider')).toEqual({
      decorator: BunServerRouter,
      options: {
        injects: ['dependency'],
      },
    });
  });
});
