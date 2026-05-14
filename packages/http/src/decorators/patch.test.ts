import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { Patch } from './patch';

describe('Patch', () => {
  it('stores PATCH route metadata', () => {
    class ExampleController {
      @Patch('/items')
      update(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'route',
      options: {
        method: 'PATCH',
        path: '/items',
      },
    });
  });
});
