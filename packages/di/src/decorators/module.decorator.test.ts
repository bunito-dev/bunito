import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './metadata';
import { Module } from './module.decorator';
import { Provider } from './provider.decorator';

describe('Module', () => {
  it('stores module metadata and optional provider metadata', () => {
    @Module({
      token: 'module-token',
      scope: 'singleton',
      injects: ['literal'],
      providers: [],
      exports: [],
    })
    class ExampleModule {}

    expect(getClassDecoratorMetadata(ExampleModule, Module)?.options).toEqual({
      token: 'module-token',
      providers: [],
      exports: [],
    });
    expect(getClassDecoratorMetadata(ExampleModule, Provider)?.options).toEqual({
      token: 'module-token',
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
    }).toThrow('@Module() decorator is already defined');
  });
});
