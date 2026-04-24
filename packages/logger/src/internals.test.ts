import { describe, expect, it } from 'bun:test';
import { Logger, LoggerConfig, LoggerExtension, LoggerModule } from './internals';

describe('logger internals', () => {
  it('re-exports internal logger building blocks', () => {
    expect(Logger).toBeFunction();
    expect(LoggerConfig).toBeObject();
    expect(LoggerExtension).toBeFunction();
    expect(LoggerModule).toBeFunction();
  });
});
