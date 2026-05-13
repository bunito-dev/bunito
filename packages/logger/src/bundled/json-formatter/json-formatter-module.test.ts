import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container/internals';
import { JSONFormatter } from './json-formatter';
import { JSONFormatterModule } from './json-formatter-module';

describe('JSONFormatterModule', () => {
  it('registers the JSON formatter extension', () => {
    expect(getClassMetadata(JSONFormatterModule, 'module')).toEqual({
      extensions: [JSONFormatter],
    });
  });
});
