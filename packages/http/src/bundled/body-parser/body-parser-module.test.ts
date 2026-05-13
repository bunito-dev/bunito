import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container/internals';
import { BodyParser } from './body-parser';
import { BodyParserModule } from './body-parser-module';

describe('BodyParserModule', () => {
  it('registers the body parser middleware extension', () => {
    expect(getClassMetadata(BodyParserModule, 'module')).toEqual({
      extensions: [BodyParser],
    });
  });
});
