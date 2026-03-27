import { describe, expect, it } from 'bun:test';
import { logFormatParser } from './log-format.parser';

describe('logFormatParser', () => {
  it('should parse log formats case-insensitively', () => {
    expect(logFormatParser('JSON')).toBe('json');
    expect(logFormatParser('prettify')).toBe('prettify');
    expect(logFormatParser('NONE')).toBe('none');
  });

  it('should return undefined for unsupported values', () => {
    expect(logFormatParser('custom')).toBeUndefined();
  });
});
