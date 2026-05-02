import { describe, expect, it } from 'bun:test';
import { getModuleMetadata } from '@bunito/container/internals';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';

describe('ConfigModule', () => {
  it('registers and exports ConfigService', () => {
    expect(getModuleMetadata(ConfigModule)).toEqual({
      providers: [ConfigService],
      exports: [ConfigService],
    });
  });
});
