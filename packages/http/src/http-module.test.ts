import { describe, expect, it } from 'bun:test';
import { ServerModule } from '@bunito/bun';
import { getClassMetadata } from '@bunito/container/internals';
import { HTTPConfig } from './http-config';
import { HTTPModule } from './http-module';
import { HTTPServerRouter } from './http-server-router';

describe('HTTPModule', () => {
  it('registers HTTP router configuration and extension', () => {
    expect(getClassMetadata(HTTPModule, 'module')).toEqual({
      imports: [ServerModule],
      configs: [HTTPConfig],
      extensions: [HTTPServerRouter],
    });
  });
});
