import { describe, expect, it } from 'bun:test';
import { CLASS_DECORATOR_METADATA_KEY } from '../constants';
import { initClassDecoratorMetadata } from './init-class-decorator-metadata';

describe('initClassDecoratorMetadata', () => {
  it('creates and reuses class metadata buckets', () => {
    const decorator = () => undefined;
    const context = { metadata: {} } as DecoratorContext;

    const metadata = initClassDecoratorMetadata(decorator, context);
    metadata.options = { value: true };

    expect(initClassDecoratorMetadata(decorator, context)).toBe(metadata);
    expect(context.metadata[CLASS_DECORATOR_METADATA_KEY]).toBeInstanceOf(Map);
  });
});
