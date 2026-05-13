import { describe, expect, it } from 'bun:test';
import { Module } from './module';
import { getClassMetadata } from './utils';

describe('Module', () => {
  it('stores module metadata and provider injection options separately', () => {
    class Dependency {}

    @Module({
      imports: [Dependency],
      providers: [Dependency],
      exports: [Dependency],
      scope: 'singleton',
      injects: [Dependency],
    })
    class ExampleModule {}

    expect(getClassMetadata(ExampleModule, 'module')).toEqual({
      imports: [Dependency],
      providers: [Dependency],
      exports: [Dependency],
    });
    expect(getClassMetadata(ExampleModule, 'provider')).toEqual({
      decorator: Module,
      options: {
        scope: 'singleton',
        injects: [Dependency],
      },
    });
  });
});
