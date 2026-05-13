import { describe, expect, it } from 'bun:test';
import { ServerModule } from '@bunito/bun';
import { getClassMetadata } from '@bunito/container/internals';
import { BodyParserModule, JSONSerializerModule } from './bundled';
import { HTTPConfig } from './http-config';
import { HTTPModule } from './http-module';
import { HTTPRouter } from './http-router';

describe('HTTPModule', () => {
  it('registers HTTP router configuration and extension', () => {
    expect(getClassMetadata(HTTPModule, 'module')).toEqual({
      imports: [ServerModule, BodyParserModule, JSONSerializerModule],
      configs: [HTTPConfig],
      extensions: [HTTPRouter],
    });
  });
});
