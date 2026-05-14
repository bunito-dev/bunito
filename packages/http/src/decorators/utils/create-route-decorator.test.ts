import { describe, expect, it } from 'bun:test';
import { getControllerProps } from '@bunito/container';
import { HTTP_CONTROLLER_KEY } from '../../constants';
import { createRouteDecorator } from './create-route-decorator';

describe('createRouteDecorator', () => {
  it('creates route metadata from a path string and extra options', () => {
    class ExampleController {
      @createRouteDecorator('GET', '/items', { injects: ['dep'] })
      list(): void {
        //
      }
    }

    expect(getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)).toEqual([
      {
        propKind: 'method',
        propKey: 'list',
        options: {
          kind: 'route',
          options: {
            method: 'GET',
            path: '/items',
            injects: ['dep'],
          },
        },
      },
    ]);
  });

  it('creates route metadata with a default path', () => {
    class ExampleController {
      @createRouteDecorator('POST')
      create(): void {
        //
      }
    }

    expect(getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)).toEqual([
      {
        propKind: 'method',
        propKey: 'create',
        options: {
          kind: 'route',
          options: {
            method: 'POST',
            path: '/',
          },
        },
      },
    ]);
  });

  it('creates route metadata from an options object', () => {
    class ExampleController {
      @createRouteDecorator('POST', {
        path: '/items',
        injects: ['body'],
      })
      create(): void {
        //
      }
    }

    expect(getControllerProps(ExampleController, HTTP_CONTROLLER_KEY)).toEqual([
      {
        propKind: 'method',
        propKey: 'create',
        options: {
          kind: 'route',
          options: {
            method: 'POST',
            path: '/items',
            injects: ['body'],
          },
        },
      },
    ]);
  });
});
