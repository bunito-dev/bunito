import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigModule } from '@bunito/core';
import { DECORATOR_METADATA_KEYS } from '@bunito/core/container';
import { HttpConfig } from './http.config';
import { HttpModule } from './http.module';
import { HttpRouter } from './http.router';

describe('HttpModule', () => {
  it('registers http config and router extensions', () => {
    expect(
      getDecoratorMetadata<{
        imports?: unknown[];
        configs?: unknown[];
        routers?: unknown[];
        exports?: unknown[];
      }>(HttpModule, DECORATOR_METADATA_KEYS.MODULE_OPTIONS),
    ).toEqual({
      imports: [ConfigModule],
      configs: [HttpConfig],
      routers: [HttpRouter],
      exports: [HttpRouter],
    });
  });
});
