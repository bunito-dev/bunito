import { describe, expect, it } from 'bun:test';
import { DEFAULT_CONTROLLER_KEY } from '../constants';
import { UsePrefix } from '../use-prefix';
import { getControllerProps } from './get-controller-props';

describe('getControllerProps', () => {
  it('returns undefined when a controller has no props', () => {
    class EmptyController {}

    expect(getControllerProps(EmptyController, Symbol('missing'))).toBeUndefined();
  });

  it('combines default controller props with keyed props', () => {
    @UsePrefix('/api')
    class PrefixedController {}

    expect(getControllerProps(PrefixedController, DEFAULT_CONTROLLER_KEY)).toEqual([
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
