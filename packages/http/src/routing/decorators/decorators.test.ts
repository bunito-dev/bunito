import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { z } from 'zod';
import { ROUTING_METADATA_KEYS } from '../constants';
import { OnException } from './on-exception';
import { OnRequest } from './on-request';
import { OnDelete, OnGet, OnPost, OnPut } from './on-request-aliases';
import { OnResponse } from './on-response';
import { UsesPath } from './uses-path';

describe('routing decorators', () => {
  it('should store class path and request/response/exception metadata', () => {
    const schema = z.object({
      params: z.object({
        id: z.string(),
      }),
    });

    @UsesPath('/users')
    class Controller {
      @OnRequest({
        path: '/:id',
        method: 'PATCH',
        schema,
      })
      patch(): void {}

      @OnResponse({
        method: 'GET',
      })
      onResponse(): Response {
        return new Response();
      }

      @OnException()
      onException(): Response {
        return new Response();
      }

      @OnGet('/get')
      get(): void {}

      @OnPost('/post', schema)
      post(): void {}

      @OnPut('/put')
      put(): void {}

      @OnDelete('/delete')
      remove(): void {}
    }

    expect(
      getDecoratorMetadata<string>(Controller, ROUTING_METADATA_KEYS.USES_PATH),
    ).toBe('/users');
    expect(
      getDecoratorMetadata<unknown[]>(Controller, ROUTING_METADATA_KEYS.ON_REQUEST),
    ).toEqual([
      {
        propKey: 'patch',
        options: {
          path: '/:id',
          method: 'PATCH',
          schema,
        },
      },
      {
        propKey: 'get',
        options: {
          path: '/get',
          method: 'GET',
          schema: undefined,
        },
      },
      {
        propKey: 'post',
        options: {
          path: '/post',
          method: 'POST',
          schema,
        },
      },
      {
        propKey: 'put',
        options: {
          path: '/put',
          method: 'PUT',
          schema: undefined,
        },
      },
      {
        propKey: 'remove',
        options: {
          path: '/delete',
          method: 'DELETE',
          schema: undefined,
        },
      },
    ]);
    expect(
      getDecoratorMetadata<unknown[]>(Controller, ROUTING_METADATA_KEYS.ON_RESPONSE),
    ).toEqual([
      {
        propKey: 'onResponse',
        options: {
          method: 'GET',
        },
      },
    ]);
    expect(
      getDecoratorMetadata<unknown[]>(Controller, ROUTING_METADATA_KEYS.ON_EXCEPTION),
    ).toEqual([
      {
        propKey: 'onException',
        options: {
          method: 'ALL',
        },
      },
    ]);
  });
});
