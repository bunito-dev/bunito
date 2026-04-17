import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigModule } from '@bunito/config';
import { DECORATOR_METADATA_KEYS } from '@bunito/container';
import { ServerConfig } from './server.config';
import { ServerModule } from './server.module';
import { ServerService } from './server.service';

describe('ServerModule', () => {
  it('registers server config and service', () => {
    expect(
      getDecoratorMetadata<{
        imports?: unknown[];
        uses?: unknown[];
        exports?: unknown[];
      }>(ServerModule, DECORATOR_METADATA_KEYS.MODULE_OPTIONS),
    ).toEqual({
      imports: [ConfigModule],
      uses: [ServerConfig, ServerService],
      exports: [ServerService],
    });
  });
});
