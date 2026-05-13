import { describe, expect, it } from 'bun:test';
import type { ClassDecorator, ClassMethodDecorator } from '../types';
import { createClassPropDecorator } from './create-class-prop-decorator';
import { getClassMetadata } from './get-class-metadata';

describe('createClassPropDecorator', () => {
  it('stores class and method prop metadata', () => {
    const key = Symbol('props');

    function ClassProp(): ClassDecorator {
      return createClassPropDecorator(key, { kind: 'class' });
    }

    function MethodProp(): ClassMethodDecorator {
      return createClassPropDecorator(key, { kind: 'method' });
    }

    @ClassProp()
    class ExampleClass {
      @MethodProp()
      method(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleClass, 'props')?.get(key)).toEqual([
      {
        propKind: 'method',
        propKey: 'method',
        options: {
          kind: 'method',
        },
      },
      {
        propKind: 'class',
        options: {
          kind: 'class',
        },
      },
    ]);
  });
});
