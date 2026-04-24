import { describe, expect, it } from 'bun:test';
import { NotImplementedException } from './not-implemented.exception';

describe('NotImplementedException', () => {
  it('creates a 501 HTTP exception', () => {
    expect(new NotImplementedException().status).toBe(501);
  });
});
