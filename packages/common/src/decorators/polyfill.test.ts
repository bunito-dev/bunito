import { describe, expect, it } from 'bun:test';

describe('decorator polyfill', () => {
  it('should expose Symbol.metadata', async () => {
    await import('./polyfill');

    expect(Symbol.metadata).toBeDefined();
    expect(typeof Symbol.metadata).toBe('symbol');
  });
});
