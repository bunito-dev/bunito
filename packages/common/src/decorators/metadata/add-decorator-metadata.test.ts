import { describe, expect, it } from 'bun:test';
import { addDecoratorMetadata } from './add-decorator-metadata';

describe('addDecoratorMetadata', () => {
  it('should create a set when metadata entry is missing', () => {
    const metadata: DecoratorMetadataObject = {};

    addDecoratorMetadata({ metadata } as DecoratorContext, 'test', 'first');

    expect(metadata.test).toBeInstanceOf(Set);
    expect(metadata.test).toEqual(new Set(['first']));
  });

  it('should append values to an existing set', () => {
    const metadata: DecoratorMetadataObject = {
      test: new Set(['first']),
    };

    addDecoratorMetadata({ metadata } as DecoratorContext, 'test', 'second');
    addDecoratorMetadata({ metadata } as DecoratorContext, 'test', 'second');

    expect(metadata.test).toEqual(new Set(['first', 'second']));
  });
});
