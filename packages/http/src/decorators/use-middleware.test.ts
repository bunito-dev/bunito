import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container/internals';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { Middleware } from '../middleware';
import { UseMiddleware } from './use-middleware';

describe('UseMiddleware', () => {
  it('stores middleware class props with options', () => {
    @Middleware()
    class ExampleMiddleware implements Middleware<{ enabled: boolean }> {}

    @UseMiddleware(ExampleMiddleware, { enabled: true })
    class ExampleController {}

    const props = getControllerProps(ExampleController, HTTP_CONTROLLER_KEY) as unknown;

    expect(props).toEqual([
      {
        propKind: 'class',
        options: {
          kind: 'middleware',
          middleware: ExampleMiddleware,
          options: {
            enabled: true,
          },
        },
      },
    ]);
  });
});
