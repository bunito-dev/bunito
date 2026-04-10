import { describe, expect, it } from 'bun:test';
import { LOG_LEVELS } from './constants';

describe('logger constants', () => {
  it('should expose log levels in descending severity order', () => {
    expect(LOG_LEVELS.FATAL).toBeGreaterThan(LOG_LEVELS.ERROR);
    expect(LOG_LEVELS.ERROR).toBeGreaterThan(LOG_LEVELS.WARN);
    expect(LOG_LEVELS.WARN).toBeGreaterThan(LOG_LEVELS.INFO);
    expect(LOG_LEVELS.INFO).toBe(LOG_LEVELS.OK);
    expect(LOG_LEVELS.INFO).toBeGreaterThan(LOG_LEVELS.DEBUG);
    expect(LOG_LEVELS.DEBUG).toBeGreaterThan(LOG_LEVELS.VERBOSE);
  });
});
