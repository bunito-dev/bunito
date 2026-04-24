import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { SERVER_EXTENSION } from './constants';
import { ServerExtension } from './server.extension';

describe('ServerExtension', () => {
  it('registers a singleton server extension', () => {
    @ServerExtension({
      injects: ['dependency'],
    })
    class TestExtension implements ServerExtension {
      processRequest(): Response {
        return new Response('ok');
      }
    }

    expect(getDecoratorMetadata(TestExtension, 'extension')).toEqual({
      key: SERVER_EXTENSION,
      options: undefined,
    });
    expect(getDecoratorMetadata(TestExtension, 'provider')).toEqual({
      options: {
        scope: 'singleton',
        injects: ['dependency'],
      },
    });
  });
});
