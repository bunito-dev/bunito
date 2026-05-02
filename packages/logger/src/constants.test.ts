import { describe, expect, it } from 'bun:test';
import { LOG_LEVELS } from './constants';

describe('LOG_LEVELS', () => {
  it('maps logger levels to numeric priorities', () => {
    expect(LOG_LEVELS).toEqual({
      FATAL: 60,
      ERROR: 50,
      WARN: 40,
      INFO: 30,
      OK: 30,
      DEBUG: 20,
      VERBOSE: 0,
    });
  });
});
