import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '@bunito/config';
import { getClassMetadata } from '@bunito/container';
import { JSONFormatterModule, PrettyFormatterModule } from './bundled';
import { Logger } from './logger';
import { LoggerConfig } from './logger-config';
import { LoggerModule } from './logger-module';
import { LoggerService } from './logger-service';

describe('LoggerModule', () => {
  it('registers logger providers, configs, and formatter modules', () => {
    expect(getClassMetadata(LoggerModule, 'module')).toEqual({
      imports: [ConfigModule, JSONFormatterModule, PrettyFormatterModule],
      configs: [LoggerConfig],
      providers: [Logger, LoggerService],
      exports: [Logger],
    });
  });
});
