import { describe, expect, it } from 'bun:test';
import { ServerModule } from '@bunito/bun';
import { getModuleMetadata } from '@bunito/container/internals';
import { HTTPModule } from './http.module';
import { HTTPRouter } from './http-router';
import { HTTPRouterConfig } from './http-router.config';

describe('HTTPModule', () => {
  it('registers HTTP router configuration and extension', () => {
    expect(getModuleMetadata(HTTPModule)).toEqual({
      imports: [ServerModule],
      configs: [HTTPRouterConfig],
      extensions: [HTTPRouter],
    });
  });
});
