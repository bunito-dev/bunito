import { describe, expect, it } from 'bun:test';
import { ConfigModule } from './config-module';
import { ConfigService } from './config-service';

describe('ConfigModule', () => {
  it('should register and export ConfigService', () => {
    expect(ConfigModule).toEqual({
      providers: [ConfigService],
      exports: [ConfigService],
    });
  });
});
