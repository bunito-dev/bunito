import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';

describe('ConfigModule', () => {
  it('registers and exports ConfigService', () => {
    expect(getDecoratorMetadata(ConfigModule, 'module')).toEqual({
      providers: [ConfigService],
      exports: [ConfigService],
    });
  });
});
