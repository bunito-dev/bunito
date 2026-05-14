import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { UseHeaders } from './use-headers';

describe('UseHeaders', () => {
  it('stores class headers from an object', () => {
    @UseHeaders({
      'Cache-Control': 'no-store',
    })
    class ExampleController {}

    const props = getControllerProps(ExampleController, HTTP_CONTROLLER_KEY) as unknown;

    expect(props).toEqual([
      {
        propKind: 'class',
        options: {
          kind: 'headers',
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      },
    ]);
  });

  it('stores method headers from a name and value', () => {
    class ExampleController {
      @UseHeaders('Content-Type', 'text/plain')
      list(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'headers',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  });
});
