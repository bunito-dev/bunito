import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { CONTROLLER_COMPONENT } from '../constants';
import { Middleware } from '../middleware';
import { UseMiddleware } from './use-middleware.decorator';

describe('UseMiddleware', () => {
  it('stores middleware options for a controller class', () => {
    @Middleware()
    class TestMiddleware {}

    @UseMiddleware(TestMiddleware, {
      enabled: true,
    } as never)
    class TestController {}

    expect(
      getDecoratorMetadata(TestController, 'classOptions')?.get(CONTROLLER_COMPONENT),
    ).toEqual([
      {
        kind: 'middleware',
        middleware: TestMiddleware,
        options: {
          enabled: true,
        },
      },
    ]);
  });
});
