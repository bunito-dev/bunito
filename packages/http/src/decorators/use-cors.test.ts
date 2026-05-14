import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { UseCORS } from './use-cors';

describe('UseCORS', () => {
  it('stores CORS class props with options', () => {
    @UseCORS({
      origin: 'https://example.com',
      methods: ['GET'],
      allowedHeaders: ['X-Trace-Id'],
      credentials: false,
      maxAge: 60,
    })
    class ExampleController {}

    const props = getControllerProps(ExampleController, HTTP_CONTROLLER_KEY) as unknown;

    expect(props).toEqual([
      {
        propKind: 'class',
        options: {
          kind: 'cors',
          options: {
            origin: 'https://example.com',
            methods: ['GET'],
            allowedHeaders: ['X-Trace-Id'],
            credentials: false,
            maxAge: 60,
          },
        },
      },
    ]);
  });
});
