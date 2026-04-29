import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '../metadata';
import { Module } from './module.decorator';
import { Provider } from './provider.decorator';

describe('Module', () => {
  it('stores module metadata and optional provider metadata', () => {
    @Module({
      scope: 'singleton',
      injects: ['literal'],
      providers: [],
      exports: [],
    })
    class ExampleModule {}

    expect(getClassMetadata(ExampleModule)?.options?.get(Module)).toEqual({
      providers: [],
      exports: [],
    });
    expect(getClassMetadata(ExampleModule)?.options?.get(Provider)).toEqual({
      scope: 'singleton',
      injects: ['literal'],
    });
  });

  it('rejects duplicate module decorators', () => {
    expect(() => {
      @Module()
      @Module()
      class DuplicateModule {}

      return DuplicateModule;
    }).toThrow('@Module decorator can only be used once');
  });
});
