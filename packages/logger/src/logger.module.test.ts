import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { JSONExtension } from './json';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerModule } from './logger.module';
import { LoggerService } from './logger.service';
import { PrettyConfig, PrettyExtension } from './pretty';

describe('LoggerModule', () => {
  it('registers logger providers, configs and formatters', () => {
    expect(getDecoratorMetadata(LoggerModule, 'module')).toEqual({
      imports: [ConfigModule],
      configs: [LoggerConfig, PrettyConfig],
      providers: [Logger, LoggerService],
      extensions: [PrettyExtension, JSONExtension],
      exports: [Logger],
    });
  });
});
