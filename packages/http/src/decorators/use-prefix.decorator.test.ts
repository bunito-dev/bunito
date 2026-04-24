import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { CONTROLLER_COMPONENT } from '../constants';
import { UsePrefix } from './use-prefix.decorator';

describe('UsePrefix', () => {
  it('stores prefix options for a controller class', () => {
    @UsePrefix('/api')
    class TestController {}

    expect(
      getDecoratorMetadata(TestController, 'classOptions')?.get(CONTROLLER_COMPONENT),
    ).toEqual([
      {
        kind: 'prefix',
        prefix: '/api',
      },
    ]);
  });
});
