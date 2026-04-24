import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { JSONMiddleware } from './json.middleware';
import { JSONModule } from './json.module';

describe('JSONModule', () => {
  it('registers JSONMiddleware as a provider', () => {
    expect(getDecoratorMetadata(JSONModule, 'module')).toEqual({
      providers: [JSONMiddleware],
    });
  });
});
