import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { Head } from './head';

describe('Head', () => {
  it('stores HEAD route metadata', () => {
    class ExampleController {
      @Head('/items')
      check(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'route',
      options: {
        method: 'HEAD',
        path: '/items',
      },
    });
  });
});
