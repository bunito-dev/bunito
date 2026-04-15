import { describe, expect, it } from 'bun:test';
import { RuntimeException } from './runtime.exception';

describe('RuntimeException', () => {
  it('sets the expected error name', () => {
    expect(new RuntimeException('Runtime').name).toBe('RuntimeException');
  });
});
