import { describe, expect, it } from 'bun:test';
import { Subject } from './subject';

describe('Subject', () => {
  it('creates a broker subject injection token', () => {
    expect(Subject()).toEqual({
      useToken: Subject,
    });
  });
});
