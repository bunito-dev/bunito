import { describe, expect, it } from 'bun:test';
import { getComponentMetadata, getProviderMetadata } from '@bunito/container/internals';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Route,
  UseMiddleware,
  UsePath,
} from './index';

describe('HTTP decorators', () => {
  it('stores controller metadata and request-scoped provider options', () => {
    @Controller('/api', { injects: ['dependency'] })
    class ExampleController {}

    expect(getComponentMetadata(ExampleController)?.get(Controller)?.value).toEqual({
      prefix: '/api',
    });
    expect(getProviderMetadata(ExampleController)?.options).toEqual({
      scope: 'request',
      injects: ['dependency'],
    });
  });

  it('accepts object and default controller options', () => {
    @Controller({
      prefix: '/object',
      scope: 'module',
    })
    class ObjectController {}

    @Controller()
    class DefaultController {}

    expect(getComponentMetadata(ObjectController)?.get(Controller)?.value).toEqual({
      prefix: '/object',
    });
    expect(getProviderMetadata(ObjectController)?.options).toEqual({
      scope: 'module',
    });
    expect(getComponentMetadata(DefaultController)?.get(Controller)?.value).toEqual({
      prefix: '/',
    });
  });

  it('stores route metadata for method decorators', () => {
    class ExampleController {
      @Route('/all', { injects: ['all'] })
      all(): void {
        //
      }

      @Get('/get', { injects: ['get'] })
      get(): void {
        //
      }

      @Post({ path: '/post', injects: ['post'] })
      post(): void {
        //
      }

      @Put()
      put(): void {
        //
      }

      @Delete('/delete')
      delete(): void {
        //
      }
    }

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.map((prop) => prop.value)).toEqual([
      {
        kind: 'route',
        options: {
          path: '/all',
          method: 'ALL',
          injects: ['all'],
        },
      },
      {
        kind: 'route',
        options: {
          path: '/get',
          method: 'GET',
          injects: ['get'],
        },
      },
      {
        kind: 'route',
        options: {
          path: '/post',
          method: 'POST',
          injects: ['post'],
        },
      },
      {
        kind: 'route',
        options: {
          path: '/',
          method: 'PUT',
        },
      },
      {
        kind: 'route',
        options: {
          path: '/delete',
          method: 'DELETE',
        },
      },
    ]);
  });

  it('stores class-level path and middleware metadata', () => {
    class ExampleMiddleware {}

    @UsePath('/v1')
    @UseMiddleware(ExampleMiddleware, { enabled: true })
    class ExampleController {}

    const props = getComponentMetadata(ExampleController)?.get(Controller)?.props ?? [];

    expect(props.map((prop) => prop.value)).toEqual([
      {
        kind: 'middleware',
        middleware: ExampleMiddleware,
        options: {
          enabled: true,
        },
      },
      {
        kind: 'prefix',
        prefix: '/v1',
      },
    ]);
  });
});
