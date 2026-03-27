import { describe, expect, it } from 'bun:test';
import { MODULE_METADATA_KEY, PROVIDER_METADATA_KEY } from '../constants';
import { Module } from './module';

function createClassContext(metadata: DecoratorMetadataObject): ClassDecoratorContext {
  return { metadata } as ClassDecoratorContext;
}

describe('Module', () => {
  it('should store module metadata and register the class as a module-scoped provider', () => {
    class TestModule {}

    const metadata: DecoratorMetadataObject = {};

    Module({
      imports: [{ providers: [] }],
      providers: [],
      controllers: [],
      exports: [],
      injects: ['dep'],
    })(TestModule, createClassContext(metadata));

    expect(metadata[MODULE_METADATA_KEY]).toEqual({
      imports: [{ providers: [] }],
      providers: [],
      controllers: [],
      exports: [],
    });
    expect(metadata[PROVIDER_METADATA_KEY]).toEqual({
      scope: 'module',
      injects: ['dep'],
      useClass: TestModule,
    });
  });
});
