import { describe, expect, it } from 'bun:test';
import { CONFIG_EXTENSION } from './constants';

describe('CONFIG_EXTENSION', () => {
  it('uses a symbol config extension key', () => {
    expect(CONFIG_EXTENSION).toBeSymbol();
  });
});
