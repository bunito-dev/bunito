import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigModule } from '../config';
import { DECORATOR_METADATA_KEYS } from '../container';
import { ServerConfig } from './server.config';
import { ServerModule } from './server.module';
import { ServerService } from './server.service';

describe('ServerModule', () => {
  it('registers server config and service', () => {
    expect(
      getDecoratorMetadata<{
        imports?: unknown[];
        configs?: unknown[];
        providers?: unknown[];
      }>(ServerModule, DECORATOR_METADATA_KEYS.MODULE_OPTIONS),
    ).toEqual({
      imports: [ConfigModule],
      configs: [ServerConfig],
      providers: [ServerService],
    });
  });
});
