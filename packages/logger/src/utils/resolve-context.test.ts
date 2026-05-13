import { describe, expect, it } from 'bun:test';
import { resolveContext } from './resolve-context';

describe('resolveContext', () => {
  it('resolves strings, classes, and arrays into logger context names', () => {
    class ExampleContext {}

    expect(resolveContext('Manual')).toBe('Manual');
    expect(resolveContext(ExampleContext)).toBe('ExampleContext');
    expect(resolveContext([ExampleContext, 'worker'])).toBe('ExampleContext.worker');
    expect(resolveContext([ExampleContext, 'worker'], ':')).toBe('ExampleContext:worker');
  });

  it('returns undefined for empty or unsupported context values', () => {
    expect(resolveContext('')).toBe('');
    expect(resolveContext([])).toBeUndefined();
    expect(resolveContext({})).toBeUndefined();
  });
});
