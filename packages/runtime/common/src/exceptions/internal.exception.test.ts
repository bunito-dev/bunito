import { describe, expect, it } from 'bun:test';
import { InternalException } from './internal.exception';

describe('InternalException', () => {
  it('sets the expected error name', () => {
    expect(new InternalException('Internal').name).toBe('InternalException');
  });
});
