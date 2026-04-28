import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './get-class-decorator-metadata';
import { setClassHandlerDecoratorMetadata } from './set-class-handler-decorator-metadata';

describe('setClassHandlerDecoratorMetadata', () => {
  it('stores method handlers and rejects duplicate handler decorators', () => {
    const classDecorator = () => undefined;
    const handlerDecorator = () => undefined;

    expect(() => {
      class Example {
        @(
          (target, context) => {
            setClassHandlerDecoratorMetadata(classDecorator, handlerDecorator, context, {
              once: true,
            });
            setClassHandlerDecoratorMetadata(classDecorator, handlerDecorator, context, {
              once: false,
            });
            return target;
          }
        )
        run(): void {
          //
        }
      }

      return Example;
    }).toThrow('decorator is already defined');

    class Other {
      @(
        (target, context) => {
          setClassHandlerDecoratorMetadata(classDecorator, handlerDecorator, context, {
            ok: true,
          });
          return target;
        }
      )
      run(): void {
        //
      }
    }

    expect(
      getClassDecoratorMetadata(Other, classDecorator)?.handlers?.get(handlerDecorator),
    ).toEqual({
      propKey: 'run',
      options: { ok: true },
    });
  });
});
