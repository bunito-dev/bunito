import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container/internals';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { Put } from './put';

describe('Put', () => {
  it('stores PUT route metadata', () => {
    class ExampleController {
      @Put('/items')
      update(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'route',
      options: {
        method: 'PUT',
        path: '/items',
      },
    });
  });
});
