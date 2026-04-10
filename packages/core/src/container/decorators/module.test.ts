import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { CONTAINER_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata, ModuleOptions } from '../types';
import { Module } from './module';

describe('Module', () => {
  it('should store module metadata and register the class as a provider', () => {
    @Module({
      imports: [{ providers: [] }],
      providers: ['dep'],
      controllers: [],
      exports: ['dep'],
      injects: ['service'],
    })
    class TestModule {}

    expect(
      getDecoratorMetadata<ModuleOptions>(TestModule, CONTAINER_METADATA_KEYS.MODULE),
    ).toEqual({
      imports: [{ providers: [] }],
      providers: ['dep', TestModule],
      controllers: [],
      exports: ['dep'],
    });
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        TestModule,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'singleton',
      injects: ['service'],
    });
  });
});
