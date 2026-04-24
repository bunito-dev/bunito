import { describe, expect, it } from 'bun:test';
import { UpgradeRequiredException } from './upgrade-required.exception';

describe('UpgradeRequiredException', () => {
  it('creates a 426 HTTP exception', () => {
    expect(new UpgradeRequiredException().status).toBe(426);
  });
});
