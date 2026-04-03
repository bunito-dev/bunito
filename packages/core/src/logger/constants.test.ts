import { describe, expect, it } from 'bun:test';
import { BUILD_IN_LOG_FORMATTERS, LOG_FORMATTERS, LOG_LEVELS } from './constants';
import { jsonFormatter, prettifyFormatter } from './formatters';

describe('logger constants', () => {
  it('should expose log levels in descending severity order', () => {
    expect(LOG_LEVELS.fatal).toBeGreaterThan(LOG_LEVELS.error);
    expect(LOG_LEVELS.error).toBeGreaterThan(LOG_LEVELS.warn);
    expect(LOG_LEVELS.warn).toBeGreaterThan(LOG_LEVELS.info);
    expect(LOG_LEVELS.ok).toBe(LOG_LEVELS.info);
    expect(LOG_LEVELS.info).toBeGreaterThan(LOG_LEVELS.trace);
    expect(LOG_LEVELS.trace).toBeGreaterThan(LOG_LEVELS.debug);
    expect(LOG_LEVELS.debug).toBeGreaterThan(LOG_LEVELS.verbose);
  });

  it('should expose built-in log formatters', () => {
    expect(BUILD_IN_LOG_FORMATTERS).toEqual({
      none: undefined,
      prettify: prettifyFormatter,
      json: jsonFormatter,
    });
    expect(LOG_FORMATTERS).toEqual(BUILD_IN_LOG_FORMATTERS);
  });
});
