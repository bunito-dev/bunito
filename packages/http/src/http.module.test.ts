import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { ServerModule } from '@bunito/server/internals';
import { HttpExtension } from './http.extension';
import { HttpModule } from './http.module';

describe('HttpModule', () => {
  it('registers the server module and HTTP extension', () => {
    expect(getDecoratorMetadata(HttpModule, 'module')).toEqual({
      imports: [ServerModule],
      extensions: [HttpExtension],
    });
  });
});
