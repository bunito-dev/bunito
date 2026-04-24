import { describe, expect, it } from 'bun:test';
import { formatTimestamp } from './format-timestamp';

describe('formatTimestamp', () => {
  it('formats local time with padded milliseconds', () => {
    expect(formatTimestamp(new Date(2026, 3, 23, 1, 2, 3, 4))).toBe('[01:02:03.004]');
  });
});
