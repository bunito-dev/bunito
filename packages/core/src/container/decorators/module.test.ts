import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata, ModuleOptions } from '../types';
import { Module } from './module';

describe('Module', () => {
  it('should store module metadata and register the class as a provider', () => {
    class TestModule {}
    const metadata = {} as DecoratorMetadataObject;

    Module({
      imports: [{ providers: [] }],
      providers: ['dep'],
      controllers: [],
      exports: ['dep'],
      injects: ['service'],
    })(TestModule, { metadata } as ClassDecoratorContext);

    expect(metadata[DECORATOR_METADATA_KEYS.module] as ModuleOptions).toEqual({
      imports: [{ providers: [] }],
      providers: ['dep', TestModule],
      controllers: [],
      exports: ['dep'],
    });
    expect(metadata[DECORATOR_METADATA_KEYS.provider] as ClassProviderMetadata).toEqual({
      scope: 'singleton',
      injects: ['service'],
    });
  });
});
