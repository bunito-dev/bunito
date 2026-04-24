import { describe, expect, it } from 'bun:test';
import { ClassMethod } from './class-method.decorator';
import { getDecoratorMetadata } from './utils';

describe('ClassMethod', () => {
  it('stores method metadata through ClassProp', () => {
    const group = Symbol('group');

    class TestClass {
      @ClassMethod(group, { method: 'GET' })
      handle(): void {
        //
      }
    }

    expect(getDecoratorMetadata(TestClass, 'classProps')?.get(group)).toEqual([
      {
        kind: 'method',
        propKey: 'handle',
        options: {
          method: 'GET',
        },
      },
    ]);
  });
});
