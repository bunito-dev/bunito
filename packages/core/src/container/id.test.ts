import { describe, expect, it } from 'bun:test';
import { Id } from './id';

describe('Id', () => {
  it('should create unique ids with an incrementing suffix', () => {
    const first = Id.create('token');
    const second = Id.create('token');

    expect(first.name).toBe('token');
    expect(first.toString()).not.toBe(second.toString());
  });

  it('should reuse ids for the same object token', () => {
    const token = {};

    expect(Id.for(token)).toBe(Id.for(token));
  });

  it('should reuse ids for string and global symbol tokens with the same key', () => {
    expect(Id.for('shared')).toBe(Id.for('shared'));
    expect(Id.for('shared')).toBe(Id.for(Symbol.for('shared')));
  });

  it('should create different ids for different tokens', () => {
    expect(Id.for({})).not.toBe(Id.for({}));
    expect(Id.for('first')).not.toBe(Id.for('second'));
  });
});
