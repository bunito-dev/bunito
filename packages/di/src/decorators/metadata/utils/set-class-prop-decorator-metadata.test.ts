import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './get-class-decorator-metadata';
import { setClassPropDecoratorMetadata } from './set-class-prop-decorator-metadata';

describe('setClassPropDecoratorMetadata', () => {
  it('stores class, field, and method prop metadata', () => {
    const classDecorator = () => undefined;
    const propDecorator = () => undefined;

    @(
      (target, context) => {
        setClassPropDecoratorMetadata(classDecorator, propDecorator, context, {
          class: true,
        });
        return target;
      }
    )
    class Example {
      @(
        (target, context) => {
          setClassPropDecoratorMetadata(classDecorator, propDecorator, context, {
            field: true,
          });
          return target;
        }
      )
      value = 1;

      @(
        (target, context) => {
          setClassPropDecoratorMetadata(classDecorator, propDecorator, context, {
            method: true,
          });
          return target;
        }
      )
      run(): void {
        //
      }
    }

    expect(getClassDecoratorMetadata(Example, classDecorator)?.props).toEqual([
      {
        decorator: propDecorator,
        propKind: 'method',
        propKey: 'run',
        options: { method: true },
      },
      {
        decorator: propDecorator,
        propKind: 'field',
        propKey: 'value',
        options: { field: true },
      },
      {
        decorator: propDecorator,
        propKind: 'class',
        propKey: undefined,
        options: { class: true },
      },
    ]);
  });
});
