import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { Module } from './module.decorator';

describe('Module', () => {
  it('stores module options and provider metadata', () => {
    class ExampleModule {}

    const metadata = {} as DecoratorMetadata;

    Module({
      uses: ['provider' as never],
      injects: ['dependency'],
      scope: 'module',
    })(ExampleModule, { metadata } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.MODULE_OPTIONS]).toEqual({
      uses: ['provider'],
    });
    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'module',
      injects: ['dependency'],
    });
  });
});
