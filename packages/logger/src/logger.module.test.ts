import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigModule } from '@bunito/config';
import { DECORATOR_METADATA_KEYS } from '@bunito/container';
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
        uses?: unknown[];
        exports?: unknown[];
      }>(LoggerModule, DECORATOR_METADATA_KEYS.MODULE_OPTIONS),
    ).toEqual({
      imports: [ConfigModule],
      uses: [
        LoggerConfig,
        PrettyConfig,
        JSONFormatter,
        PrettyFormatter,
        Logger,
        LoggerService,
      ],
      exports: [Logger],
    });
  });
});
