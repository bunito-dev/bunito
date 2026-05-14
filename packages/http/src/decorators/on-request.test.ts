import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../constants';
import { OnRequest } from './on-request';

describe('OnRequest', () => {
  it('stores ALL route metadata', () => {
    class ExampleController {
      @OnRequest('/items')
      handle(): void {
        //
      }
    }

    expect(
      getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)?.[0]?.options,
    ).toEqual({
      kind: 'route',
      options: {
        method: 'ALL',
        path: '/items',
      },
    });
  });
});
