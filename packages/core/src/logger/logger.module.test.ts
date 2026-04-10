import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigModule } from '../config';
import type { ClassProviderMetadata, ModuleOptions } from '../container';
import { CONTAINER_METADATA_KEYS } from '../container';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

describe('LoggerModule', () => {
  it('should register logger dependencies and export Logger', () => {
    expect(
      getDecoratorMetadata<ModuleOptions>(LoggerModule, CONTAINER_METADATA_KEYS.MODULE),
    ).toEqual({
      imports: [ConfigModule],
      providers: [LoggerConfig, Logger, LoggerService, LoggerModule],
      exports: [Logger],
    });
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        LoggerModule,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'singleton',
      injects: undefined,
    });
  });
});
