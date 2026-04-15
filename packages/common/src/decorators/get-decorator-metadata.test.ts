import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from './get-decorator-metadata';

describe('getDecoratorMetadata', () => {
  it('returns metadata stored under a symbol key', () => {
    const key = Symbol('metadata-key');
    const metadata = {
      [key]: { enabled: true },
    } satisfies DecoratorMetadata;

    class Example {}

    Example[Symbol.metadata ?? Symbol.for('Symbol.metadata')] = metadata;

    const result = getDecoratorMetadata<{ enabled: boolean }>(Example, key);

    expect(result).toEqual({ enabled: true });
  });

  it('returns undefined when metadata is missing', () => {
    class Example {}

    expect(getDecoratorMetadata(Example, Symbol('unknown'))).toBeUndefined();
  });
});
