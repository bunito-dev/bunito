import { describe, expect, it } from 'bun:test';
import { Module } from './module.decorator';
import { Provider } from './provider.decorator';
import { getModuleMetadata, getProviderMetadata } from './utils';

describe('Module', () => {
  it('stores module metadata and optional provider metadata', () => {
    @Module({
      scope: 'singleton',
      injects: ['literal'],
      providers: [],
      exports: [],
    })
    class ExampleModule {}

    expect(getModuleMetadata(ExampleModule)).toEqual({
      providers: [],
      exports: [],
    });
    expect(getProviderMetadata(ExampleModule)?.options).toEqual({
      scope: 'singleton',
      injects: ['literal'],
    });
  });

  it('rejects duplicate module decorators and provider conflicts', () => {
    expect(() => {
      @Module()
      @Module()
      class DuplicateModule {}

      return DuplicateModule;
    }).toThrow('@Module() decorator can only be applied once');

    expect(() => {
      @Module()
      @Provider()
      class ConflictingModule {}

      return ConflictingModule;
    }).toThrow('@Module() decorator conflicts with @Provider() decorator');
  });
});
