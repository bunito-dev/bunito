import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { DECORATOR_METADATA_KEYS } from '@bunito/container';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';

describe('ConfigModule', () => {
  it('registers and exports ConfigService', () => {
    expect(
      getDecoratorMetadata<{
        uses?: unknown[];
        exports?: unknown[];
      }>(ConfigModule, DECORATOR_METADATA_KEYS.MODULE_OPTIONS),
    ).toEqual({
      uses: [ConfigService],
      exports: [ConfigService],
    });
  });
});
