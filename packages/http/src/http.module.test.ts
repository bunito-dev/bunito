import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { ConfigModule } from '@bunito/config';
import { DECORATOR_METADATA_KEYS } from '@bunito/container';
import { ServerModule } from '@bunito/server';
import { HttpConfig } from './http.config';
import { HttpModule } from './http.module';
import { HttpRouter } from './http.router';

describe('HttpModule', () => {
  it('registers http config and router extensions', () => {
    expect(
      getDecoratorMetadata<{
        imports?: unknown[];
        uses?: unknown[];
        exports?: unknown[];
      }>(HttpModule, DECORATOR_METADATA_KEYS.MODULE_OPTIONS),
    ).toEqual({
      imports: [ConfigModule, ServerModule],
      uses: [HttpConfig, HttpRouter],
      exports: [HttpRouter],
    });
  });
});
