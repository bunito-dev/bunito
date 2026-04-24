import { describe, expect, it } from 'bun:test';
import { ClassProp } from './class-prop.decorator';
import { getDecoratorMetadata } from './utils';

describe('ClassProp', () => {
  it('stores grouped class property metadata', () => {
    const group = Symbol('group');

    class TestClass {
      @ClassProp(group, { token: 'field' })
      field = 'value';
    }

    expect(getDecoratorMetadata(TestClass, 'classProps')).toEqual(
      new Map([
        [
          group,
          [
            {
              kind: 'field',
              propKey: 'field',
              options: {
                token: 'field',
              },
            },
          ],
        ],
      ]),
    );
  });
});
