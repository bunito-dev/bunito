import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { CONTROLLER_COMPONENT } from '../constants';
import { All, Delete, Get, Patch, Post, Put, Route } from './route.decorator';

describe('Route', () => {
  it('stores route metadata for every HTTP route decorator', () => {
    class TestController {
      @Route('/custom', {
        method: 'OPTIONS',
        injects: ['request'],
      })
      custom(): void {
        //
      }

      @All('/all')
      all(): void {
        //
      }

      @Get('/get')
      get(): void {
        //
      }

      @Post({ path: '/post' })
      post(): void {
        //
      }

      @Put('/put')
      put(): void {
        //
      }

      @Delete('/delete')
      delete(): void {
        //
      }

      @Patch('/patch')
      patch(): void {
        //
      }
    }

    expect(
      getDecoratorMetadata(TestController, 'classProps')?.get(CONTROLLER_COMPONENT),
    ).toEqual([
      expect.objectContaining({
        propKey: 'custom',
        options: {
          method: 'OPTIONS',
          path: '/custom',
          injects: ['request'],
        },
      }),
      expect.objectContaining({
        propKey: 'all',
        options: {
          method: undefined,
          path: '/all',
        },
      }),
      expect.objectContaining({
        propKey: 'get',
        options: {
          method: 'GET',
          path: '/get',
        },
      }),
      expect.objectContaining({
        propKey: 'post',
        options: {
          method: 'POST',
          path: '/post',
        },
      }),
      expect.objectContaining({
        propKey: 'put',
        options: {
          method: 'PUT',
          path: '/put',
        },
      }),
      expect.objectContaining({
        propKey: 'delete',
        options: {
          method: 'DELETE',
          path: '/delete',
        },
      }),
      expect.objectContaining({
        propKey: 'patch',
        options: {
          method: 'PATCH',
          path: '/patch',
        },
      }),
    ]);
  });
});
