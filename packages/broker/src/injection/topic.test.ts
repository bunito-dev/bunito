import { describe, expect, it } from 'bun:test';
import { Topic } from './topic';

describe('Topic', () => {
  it('creates a broker topic injection token', () => {
    expect(Topic()).toEqual({
      useToken: Topic,
    });
  });
});
