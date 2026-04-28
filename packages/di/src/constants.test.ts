import { describe, expect, it } from 'bun:test';
import {
  GLOBAL_SCOPE_ID,
  MODULE_ID,
  PARENT_MODULE_IDS,
  PARENT_PROVIDER_ID,
  PROVIDER_OPTIONS,
  REQUEST_ID,
  ROOT_MODULE_ID,
} from './constants';
import { Id } from './id';

describe('constants', () => {
  it('exports internal injection ids', () => {
    expect(GLOBAL_SCOPE_ID).toBeInstanceOf(Id);
    expect(MODULE_ID.toString()).toBe('MODULE_ID');
    expect(ROOT_MODULE_ID.toString()).toBe('ROOT_MODULE_ID');
    expect(PARENT_MODULE_IDS.toString()).toBe('PARENT_MODULE_IDS');
    expect(REQUEST_ID.toString()).toBe('REQUEST_ID');
    expect(PARENT_PROVIDER_ID.toString()).toBe('PARENT_PROVIDER_ID');
    expect(PROVIDER_OPTIONS.toString()).toBe('PROVIDER_OPTIONS');
  });
});
