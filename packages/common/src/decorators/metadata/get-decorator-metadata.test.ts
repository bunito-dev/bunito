import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from './get-decorator-metadata';

describe('getDecoratorMetadata', () => {
  it('should return metadata stored under the given key', () => {
    class TestTarget {}

    Object.defineProperty(TestTarget, Symbol.metadata, {
      value: {
        test: ['value'],
      },
      configurable: true,
    });

    expect(getDecoratorMetadata<Array<string>>(TestTarget, 'test')).toEqual(['value']);
  });

  it('should return undefined when metadata or key is missing', () => {
    class WithoutMetadata {}
    class WithDifferentMetadata {}

    Object.defineProperty(WithDifferentMetadata, Symbol.metadata, {
      value: {
        other: 123,
      },
      configurable: true,
    });

    expect(getDecoratorMetadata(WithoutMetadata, 'test')).toBeUndefined();
    expect(getDecoratorMetadata(WithDifferentMetadata, 'test')).toBeUndefined();
  });
});
