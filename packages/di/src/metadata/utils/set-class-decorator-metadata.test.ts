import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from './get-class-metadata';
import { setClassDecoratorMetadata } from './set-class-decorator-metadata';

describe('setClassDecoratorMetadata', () => {
  it('stores options, handler, and prop metadata', () => {
    const OptionsDecorator = () => undefined;
    const HandlerDecorator = () => undefined;
    const PropDecorator = () => undefined;

    @(
      (target, context) => {
        expect(
          setClassDecoratorMetadata(OptionsDecorator, 'options', context, {
            option: true,
          }),
        ).toBe(true);
        setClassDecoratorMetadata(PropDecorator, 'prop', context, { class: true });
        return target;
      }
    )
    class Example {
      @(
        (target, context) => {
          setClassDecoratorMetadata(PropDecorator, 'prop', context, { field: true });
          return target;
        }
      )
      value = 1;

      @(
        (target, context) => {
          setClassDecoratorMetadata(HandlerDecorator, 'handler', context, {
            handler: true,
          });
          setClassDecoratorMetadata(PropDecorator, 'prop', context, { method: true });
          return target;
        }
      )
      run(): void {
        //
      }
    }

    const metadata = getClassMetadata(Example);

    expect(metadata?.options?.get(OptionsDecorator)).toEqual({ option: true });
    expect(metadata?.handlers?.get(HandlerDecorator)).toEqual({
      propKey: 'run',
      options: {
        handler: true,
      },
    });
    expect(metadata?.props?.get(PropDecorator)).toEqual([
      {
        propKind: 'method',
        propKey: 'run',
        options: { method: true },
      },
      {
        propKind: 'field',
        propKey: 'value',
        options: { field: true },
      },
      {
        propKind: 'class',
        options: { class: true },
      },
    ]);
  });

  it('rejects duplicate singleton metadata and supports silent failures', () => {
    const OptionsDecorator = () => undefined;
    const HandlerDecorator = () => undefined;

    expect(() => {
      @(
        (target, context) => {
          setClassDecoratorMetadata(OptionsDecorator, 'options', context, {
            first: true,
          });
          setClassDecoratorMetadata(OptionsDecorator, 'options', context, {
            second: true,
          });
          return target;
        }
      )
      class DuplicateOptions {}

      return DuplicateOptions;
    }).toThrow('can only be used once');

    class SilentOptions {
      @(
        (target, context) => {
          expect(
            setClassDecoratorMetadata(
              OptionsDecorator,
              'options',
              context as unknown as ClassDecoratorContext,
              {},
              false,
            ),
          ).toBe(false);
          expect(
            setClassDecoratorMetadata(HandlerDecorator, 'handler', context, {}, false),
          ).toBe(true);
          expect(
            setClassDecoratorMetadata(HandlerDecorator, 'handler', context, {}, false),
          ).toBe(false);
          return target;
        }
      )
      run(): void {
        //
      }
    }

    expect(getClassMetadata(SilentOptions)?.handlers?.has(HandlerDecorator)).toBe(true);
  });
});
