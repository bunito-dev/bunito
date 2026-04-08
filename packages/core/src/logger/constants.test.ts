import { describe, expect, it } from 'bun:test';
import { BUILD_IN_LOG_FORMATTERS, LOG_FORMATTERS, LOG_LEVEL } from './constants';
import { jsonFormatter, prettifyFormatter } from './formatters';

describe('logger constants', () => {
  it('should expose log levels in descending severity order', () => {
    expect(LOG_LEVEL.fatal).toBeGreaterThan(LOG_LEVEL.error);
    expect(LOG_LEVEL.error).toBeGreaterThan(LOG_LEVEL.warn);
    expect(LOG_LEVEL.warn).toBeGreaterThan(LOG_LEVEL.info);
    expect(LOG_LEVEL.ok).toBe(LOG_LEVEL.info);
    expect(LOG_LEVEL.info).toBeGreaterThan(LOG_LEVEL.trace);
    expect(LOG_LEVEL.trace).toBeGreaterThan(LOG_LEVEL.debug);
    expect(LOG_LEVEL.debug).toBeGreaterThan(LOG_LEVEL.verbose);
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
