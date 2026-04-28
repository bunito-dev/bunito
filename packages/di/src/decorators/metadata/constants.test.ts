import { describe, expect, it } from 'bun:test';
import { CLASS_DECORATOR_METADATA_KEY } from './constants';

describe('metadata constants', () => {
  it('exports the class metadata key', () => {
    expect(CLASS_DECORATOR_METADATA_KEY).toBeSymbol();
  });
});
