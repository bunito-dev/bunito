import { describe, expect, it } from 'bun:test';
import './polyfill';

describe('metadata polyfill', () => {
  it('ensures Symbol.metadata is available', () => {
    expect(Symbol.metadata).toBeSymbol();
  });
});
