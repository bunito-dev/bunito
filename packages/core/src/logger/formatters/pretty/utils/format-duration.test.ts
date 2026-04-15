import { describe, expect, it } from 'bun:test';
import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('formats millisecond and second durations', () => {
    expect(formatDuration(0)).toBe('~1ms');
    expect(formatDuration(10)).toBe('+10ms');
    expect(formatDuration(1001)).toBe('+1.001s');
  });
});
