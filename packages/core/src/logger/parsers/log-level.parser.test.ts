import { describe, expect, it } from 'bun:test';
import { logLevelParser } from './log-level.parser';

describe('logLevelParser', () => {
  it('should parse log levels case-insensitively', () => {
    expect(logLevelParser('INFO')).toBe('info');
    expect(logLevelParser('debug')).toBe('debug');
  });

  it('should return undefined for unsupported values', () => {
    expect(logLevelParser('invalid')).toBeUndefined();
  });
});
