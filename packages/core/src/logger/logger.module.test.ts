import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigModule } from '../config';
import { DECORATOR_METADATA_KEYS } from '../container';
import { JSONFormatter, PrettyConfig, PrettyFormatter } from './formatters';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

describe('LoggerModule', () => {
  it('registers logger providers, configs and formatters', () => {
    expect(
      getDecoratorMetadata<{
        imports?: unknown[];
        configs?: unknown[];
        providers?: unknown[];
        formatters?: unknown[];
        exports?: unknown[];
      }>(LoggerModule, DECORATOR_METADATA_KEYS.MODULE_OPTIONS),
    ).toEqual({
      imports: [ConfigModule],
      configs: [LoggerConfig, PrettyConfig],
      providers: [Logger, LoggerService],
      formatters: [JSONFormatter, PrettyFormatter],
      exports: [Logger],
    });
  });
});
