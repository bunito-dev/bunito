import { describe, expect, it } from 'bun:test';
import { Data } from './data';

describe('Data', () => {
  it('creates a broker data injection token', () => {
    expect(Data()).toEqual({
      useToken: Data,
    });
  });
});
