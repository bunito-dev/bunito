import { describe, expect, it } from 'bun:test';
import { createImmutableDecorator } from './create-immutable-decorator';

describe('createImmutableDecorator', () => {
  it('should forward target and context to the handler and return the same target', () => {
    const target = class TestTarget {};
    const metadata = {} as DecoratorMetadataObject;
    const seen: unknown[] = [];
    const decorator = createImmutableDecorator<ClassDecoratorContext>(
      (context, value) => {
        seen.push(context.metadata, value);
        context.metadata.test = 'value';
      },
    );

    const result = decorator(target, { metadata } as ClassDecoratorContext);

    expect(result).toBe(target);
    expect(seen).toEqual([metadata, target]);
    expect(metadata.test).toBe('value');
  });
});
