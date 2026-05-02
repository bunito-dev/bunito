import { describe, expect, it } from 'bun:test';
import { LoggerException } from './logger.exception';

describe('LoggerException', () => {
  it('uses a logger-specific exception name', () => {
    const error = new LoggerException('Invalid logger');

    expect(error.name).toBe('LoggerException');
    expect(error.message).toBe('Invalid logger');
  });
});
