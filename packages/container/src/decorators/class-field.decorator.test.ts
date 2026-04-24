import { describe, expect, it } from 'bun:test';
import { ClassField } from './class-field.decorator';
import { getDecoratorMetadata } from './utils';

describe('ClassField', () => {
  it('stores field metadata through ClassProp', () => {
    const group = Symbol('group');

    class TestClass {
      @ClassField(group, { required: true })
      value = 1;
    }

    expect(getDecoratorMetadata(TestClass, 'classProps')?.get(group)).toEqual([
      {
        kind: 'field',
        propKey: 'value',
        options: {
          required: true,
        },
      },
    ]);
  });
});
