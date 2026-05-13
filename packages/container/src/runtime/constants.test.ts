import { describe, expect, it } from 'bun:test';
import { Id } from '../utils';
import {
  GLOBAL_MODULE_ID,
  MODULE_ID,
  PARENT_MODULE_IDS,
  REQUEST_ID,
  REQUEST_ID_GETTER,
  REQUEST_STATE,
  ROOT_MODULE_ID,
} from './constants';

describe('constants', () => {
  it('exports internal injection ids', () => {
    expect(GLOBAL_MODULE_ID).toBeInstanceOf(Id);
    expect(MODULE_ID.toString()).toBe('MODULE_ID');
    expect(ROOT_MODULE_ID.toString()).toBe('ROOT_MODULE_ID');
    expect(PARENT_MODULE_IDS.toString()).toBe('PARENT_MODULE_IDS');
    expect(REQUEST_ID.toString()).toBe('REQUEST_ID');
    expect(REQUEST_ID_GETTER.toString()).toBe('REQUEST_ID_GETTER');
    expect(REQUEST_STATE.toString()).toBe('REQUEST_STATE');
  });
});
