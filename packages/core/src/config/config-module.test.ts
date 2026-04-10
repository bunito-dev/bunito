import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import type { ClassProviderMetadata, ModuleOptions } from '../container';
import { CONTAINER_METADATA_KEYS } from '../container';
import { ConfigModule } from './config-module';
import { ConfigService } from './config-service';

describe('ConfigModule', () => {
  it('should register and export ConfigService through module metadata', () => {
    expect(
      getDecoratorMetadata<ModuleOptions>(ConfigModule, CONTAINER_METADATA_KEYS.MODULE),
    ).toEqual({
      providers: [ConfigService, ConfigModule],
      exports: [ConfigService],
    });
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        ConfigModule,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'singleton',
      injects: undefined,
    });
  });
});
