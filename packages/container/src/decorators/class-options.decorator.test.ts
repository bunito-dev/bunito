import { describe, expect, it } from 'bun:test';
import { ClassOptions } from './class-options.decorator';
import { getDecoratorMetadata } from './utils';

describe('ClassOptions', () => {
  it('stores grouped class-level options in declaration order', () => {
    const group = Symbol('group');

    @ClassOptions(group, { prefix: '/parent' })
    @ClassOptions(group, { prefix: '/child' })
    class TestClass {}

    expect(getDecoratorMetadata(TestClass, 'classOptions')).toEqual(
      new Map([
        [
          group,
          [
            {
              prefix: '/child',
            },
            {
              prefix: '/parent',
            },
          ],
        ],
      ]),
    );
  });
});
