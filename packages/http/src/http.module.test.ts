import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import type { ClassProviderMetadata, ModuleOptions } from '@bunito/core';
import { CONTAINER_METADATA_KEYS, ConfigModule, LoggerModule } from '@bunito/core';
import { HttpConfig } from './http.config';
import { HttpModule } from './http.module';
import { HttpService } from './http.service';
import { RoutingModule } from './routing';

describe('HttpModule', () => {
  it('should register http dependencies and export HttpService', () => {
    expect(
      getDecoratorMetadata<ModuleOptions>(HttpModule, CONTAINER_METADATA_KEYS.MODULE),
    ).toEqual({
      imports: [LoggerModule, ConfigModule, RoutingModule],
      providers: [HttpConfig, HttpService, HttpModule],
      exports: [HttpService],
    });
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        HttpModule,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'singleton',
      injects: undefined,
    });
  });
});
