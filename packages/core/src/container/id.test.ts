import { describe, expect, it } from 'bun:test';
import { Id } from './id';

describe('Id', () => {
  it('should create unique ids with an incrementing suffix', () => {
    const first = Id.unique('token');
    const second = Id.unique('token');

    expect(first.name).toBe('token');
    expect(first.index).toBe(1);
    expect(second.index).toBe(2);
    expect(first.toString()).toBe('token#1');
    expect(second.toString()).toBe('token#2');
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

  it('should recognize id instances and preserve them', () => {
    const id = new Id('existing');

    expect(Id.isInstance(id)).toBeTrue();
    expect(Id.for(id)).toBe(id);
    expect(id.toString()).toBe('existing');
  });
});
