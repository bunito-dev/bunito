import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { JSONSerializer } from './json-serializer';
import { JSONSerializerModule } from './json-serializer-module';

describe('JSONSerializerModule', () => {
  it('registers the JSON serializer middleware extension', () => {
    expect(getClassMetadata(JSONSerializerModule, 'module')).toEqual({
      extensions: [JSONSerializer],
    });
  });
});
