import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { ConfigModule } from './config-module';
import { ConfigService } from './config-service';

describe('ConfigModule', () => {
  it('registers and exports ConfigService', () => {
    expect(getClassMetadata(ConfigModule, 'module')).toEqual({
      providers: [ConfigService],
      exports: [ConfigService],
    });
  });
});
