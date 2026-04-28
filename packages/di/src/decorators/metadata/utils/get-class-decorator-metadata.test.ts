import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './get-class-decorator-metadata';
import { setClassOptionsDecoratorMetadata } from './set-class-options-decorator-metadata';

describe('getClassDecoratorMetadata', () => {
  it('reads metadata from classes and instances only', () => {
    const decorator = () => undefined;

    @(
      (target, context) => {
        setClassOptionsDecoratorMetadata(decorator, context, { enabled: true });
        return target;
      }
    )
    class Example {}

    expect(getClassDecoratorMetadata(Example, decorator)?.options).toEqual({
      enabled: true,
    });
    expect(getClassDecoratorMetadata(new Example(), decorator)?.options).toEqual({
      enabled: true,
    });
    expect(getClassDecoratorMetadata('not-a-class', decorator)).toBeUndefined();
  });
});
