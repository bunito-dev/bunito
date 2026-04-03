import { describe, expect, it } from 'bun:test';
import { ConfigModule } from '../config';
import { Logger } from './logger';
import { LoggerConfig } from './logger.config';
import { LoggerModule } from './logger.module';

describe('LoggerModule', () => {
  it('should register logger dependencies and export Logger', () => {
    expect(LoggerModule).toEqual({
      imports: [ConfigModule],
      providers: [LoggerConfig, Logger],
      exports: [Logger],
    });
  });
});
