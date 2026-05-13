import { describe, expect, it } from 'bun:test';
import { DEFAULT_CONTROLLER_KEY } from './constants';
import { UsePrefix } from './use-prefix';
import { getControllerProps } from './utils';

describe('UsePrefix', () => {
  it('stores controller prefix props on classes', () => {
    @UsePrefix('/api')
    class ExampleController {}

    expect(getControllerProps(ExampleController, DEFAULT_CONTROLLER_KEY)).toEqual([
      {
        propKind: 'class',
        options: {
          kind: 'prefix',
          prefix: '/api',
        },
      },
      {
        propKind: 'class',
        options: {
          kind: 'prefix',
          prefix: '/api',
        },
      },
    ]);
  });
});
