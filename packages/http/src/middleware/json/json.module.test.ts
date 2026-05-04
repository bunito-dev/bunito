import { describe, expect, it } from 'bun:test';
import { getModuleMetadata } from '@bunito/container/internals';
import { JSONModule } from './json.module';
import { JSONMiddleware } from './json-middleware';

describe('JSONModule', () => {
  it('registers JSON middleware as an extension', () => {
    expect(getModuleMetadata(JSONModule)).toEqual({
      extensions: [JSONMiddleware],
    });
  });
});
