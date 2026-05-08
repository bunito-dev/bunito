import { describe, expect, it } from 'bun:test';
import { extractWords } from './extract-words';

describe('extractWords', () => {
  it('extracts lowercase words from mixed input', () => {
    expect(extractWords('HTTPServer api_app 42')).toEqual([
      'httpserver',
      'api',
      'app',
      '42',
    ]);
    expect(extractWords('')).toEqual([]);
  });
});
