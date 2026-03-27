import { describe, expect, it } from 'bun:test';
import { configModule } from './config-module';
import { ConfigService } from './config-service';

describe('configModule', () => {
  it('should register and export ConfigService', () => {
    expect(configModule).toEqual({
      providers: [ConfigService],
      exports: [ConfigService],
    });
  });
});
