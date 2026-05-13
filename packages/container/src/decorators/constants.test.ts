import { describe, expect, it } from 'bun:test';
import { CLASS_METADATA_KEYS, DEFAULT_CONTROLLER_KEY } from './constants';

describe('decorator constants', () => {
  it('exports class metadata and default controller keys', () => {
    expect(
      Object.values(CLASS_METADATA_KEYS).every((key) => typeof key === 'symbol'),
    ).toBeTrue();
    expect(DEFAULT_CONTROLLER_KEY).toBeTypeOf('symbol');
  });
});
