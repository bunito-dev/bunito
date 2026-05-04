import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getModuleMetadata } from '@bunito/container/internals';
import { JSONFormatter, PrettyFormatter, PrettyFormatterConfig } from './formatters';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';

describe('LoggerModule', () => {
  it('registers logger providers, configs, and formatter extensions', () => {
    expect(getModuleMetadata(LoggerModule)).toEqual({
      imports: [ConfigModule],
      configs: [LoggerConfig, PrettyFormatterConfig],
      providers: [Logger, LoggerService],
      extensions: [PrettyFormatter, JSONFormatter],
      exports: [Logger],
    });
  });
});
