import { describe, expect, it } from 'bun:test';
import { BROKER_CONTROLLER_KEY } from './constants';

describe('broker constants', () => {
  it('exports the broker controller metadata key', () => {
    expect(BROKER_CONTROLLER_KEY).toBeTypeOf('symbol');
  });
});
