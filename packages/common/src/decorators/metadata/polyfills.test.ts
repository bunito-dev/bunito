import { describe, expect, it } from 'bun:test';
import './polyfills';

describe('metadata polyfills', () => {
  it('should define Symbol.metadata', () => {
    expect(Symbol.metadata).toBeDefined();
    expect(typeof Symbol.metadata).toBe('symbol');
  });
});
