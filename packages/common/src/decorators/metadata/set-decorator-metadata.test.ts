import { describe, expect, it } from 'bun:test';
import { setDecoratorMetadata } from './set-decorator-metadata';

describe('setDecoratorMetadata', () => {
  it('should set the metadata value under the provided key', () => {
    const metadata: DecoratorMetadataObject = {};

    setDecoratorMetadata({ metadata } as DecoratorContext, 'test', { foo: 'bar' });

    expect(metadata.test).toEqual({ foo: 'bar' });
  });

  it('should overwrite an existing metadata value', () => {
    const metadata: DecoratorMetadataObject = {
      test: 'before',
    };

    setDecoratorMetadata({ metadata } as DecoratorContext, 'test', 'after');

    expect(metadata.test).toBe('after');
  });
});
