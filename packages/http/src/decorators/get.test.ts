import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container/internals';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { Get } from './get';

describe('Get', () => {
  it('stores GET route metadata', () => {
    class ExampleController {
      @Get('/items')
      list(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'route',
      options: {
        method: 'GET',
        path: '/items',
      },
    });
  });
});
