import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './get-class-decorator-metadata';
import { setClassOptionsDecoratorMetadata } from './set-class-options-decorator-metadata';

describe('setClassOptionsDecoratorMetadata', () => {
  it('stores options once and merges duplicate writes', () => {
    const decorator = () => undefined;

    @(
      (target, context) => {
        expect(setClassOptionsDecoratorMetadata(decorator, context, { a: 1 })).toBe(true);
        expect(setClassOptionsDecoratorMetadata(decorator, context, { b: 2 })).toBe(
          false,
        );
        return target;
      }
    )
    class Example {}

    expect(getClassDecoratorMetadata(Example, decorator)?.options).toEqual({
      a: 1,
      b: 2,
    });
  });
});
