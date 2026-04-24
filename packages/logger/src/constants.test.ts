import { describe, expect, it } from 'bun:test';
import { LOG_LEVELS, LOGGER_EXTENSION } from './constants';

describe('LOGGER_EXTENSION', () => {
  it('uses a symbol extension key', () => {
    expect(LOGGER_EXTENSION).toBeSymbol();
  });
});

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
