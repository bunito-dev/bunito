import { describe, expect, it } from 'bun:test';
import { PROCESS_ENV } from './constants';

describe('testing env constants', () => {
  it('stores the initial process environment snapshot', () => {
    expect(PROCESS_ENV).toBeObject();
  });
});
