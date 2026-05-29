import { describe, expect, it } from 'bun:test';
import { BunServerModule } from '@bunito/bun';
import { getClassMetadata } from '@bunito/container';
import { BodyParserModule, JSONSerializerModule } from './bundled';
import { HTTPBunServerRouter } from './http.bun-server-router';
import { HTTPConfig } from './http.config';
import { HTTPModule } from './http.module';

describe('HTTPModule', () => {
  it('registers HTTP router configuration and extension', () => {
    expect(getClassMetadata(HTTPModule, 'module')).toEqual({
      imports: [BunServerModule, BodyParserModule, JSONSerializerModule],
      configs: [HTTPConfig],
      extensions: [HTTPBunServerRouter],
    });
  });
});
