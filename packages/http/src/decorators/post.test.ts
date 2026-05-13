import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container/internals';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { Post } from './post';

describe('Post', () => {
  it('stores POST route metadata', () => {
    class ExampleController {
      @Post('/items')
      create(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'route',
      options: {
        method: 'POST',
        path: '/items',
      },
    });
  });
});
