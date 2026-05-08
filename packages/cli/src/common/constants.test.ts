import { describe, expect, it } from 'bun:test';
import { RESERVED_NAMES, ROOT_PATH } from './constants';

describe('common constants', () => {
  it('exports the package root and reserved JavaScript names', () => {
    expect(ROOT_PATH).toEndWith('packages/cli');
    expect(RESERVED_NAMES.has('class')).toBeTrue();
    expect(RESERVED_NAMES.has('bunito')).toBeFalse();
  });
});
