import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container/internals';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { Delete } from './delete';

describe('Delete', () => {
  it('stores DELETE route metadata', () => {
    class ExampleController {
      @Delete('/items')
      remove(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'route',
      options: {
        method: 'DELETE',
        path: '/items',
      },
    });
  });
});
