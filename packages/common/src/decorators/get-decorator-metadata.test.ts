import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from './get-decorator-metadata';

describe('getDecoratorMetadata', () => {
  it('should return metadata stored on the decorated target', () => {
    const key = Symbol('test');
    class TestTarget {}

    Object.defineProperty(TestTarget, Symbol.metadata, {
      value: {
        [key]: 'value',
      },
      configurable: true,
    });

    expect(getDecoratorMetadata<string>(TestTarget, key)).toBe('value');
  });

  it('should return undefined when metadata or key is missing', () => {
    const key = Symbol('missing');
    class TestTarget {}

    expect(getDecoratorMetadata(TestTarget, key)).toBeUndefined();
  });
});
