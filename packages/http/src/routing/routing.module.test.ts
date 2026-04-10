import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import type { ClassProviderMetadata, ModuleOptions } from '@bunito/core';
import { CONTAINER_METADATA_KEYS, ConfigModule, LoggerModule } from '@bunito/core';
import { RoutingConfig } from './routing.config';
import { RoutingModule } from './routing.module';
import { RoutingService } from './routing.service';

describe('RoutingModule', () => {
  it('should register routing dependencies and export RoutingService', () => {
    expect(
      getDecoratorMetadata<ModuleOptions>(RoutingModule, CONTAINER_METADATA_KEYS.MODULE),
    ).toEqual({
      imports: [ConfigModule, LoggerModule],
      providers: [RoutingConfig, RoutingService, RoutingModule],
      exports: [RoutingService],
    });
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        RoutingModule,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'singleton',
      injects: undefined,
    });
  });
});
