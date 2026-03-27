import { describe, expect, it } from 'bun:test';
import { pushDecoratorMetadata } from './push-decorator-metadata';

describe('pushDecoratorMetadata', () => {
  it('should create an array when metadata entry is missing', () => {
    const metadata: DecoratorMetadataObject = {};

    pushDecoratorMetadata({ metadata } as DecoratorContext, 'test', 'first');

    expect(metadata.test).toEqual(['first']);
  });

  it('should append values to an existing array', () => {
    const metadata: DecoratorMetadataObject = {
      test: ['first'],
    };

    pushDecoratorMetadata({ metadata } as DecoratorContext, 'test', 'second');

    expect(metadata.test).toEqual(['first', 'second']);
  });
});
