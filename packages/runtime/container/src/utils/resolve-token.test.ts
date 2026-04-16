import { describe, expect, it } from 'bun:test';
import { Id } from '../id';
import { resolveToken } from './resolve-token';

describe('resolveToken', () => {
  it('resolves explicit, class and factory tokens', () => {
    class NamedClass {}

    expect(resolveToken({ token: 'explicit', useValue: true })).toBe(Id.for('explicit'));
    expect(resolveToken({ useClass: NamedClass })).toBe(Id.for(NamedClass));
    expect(resolveToken({ useFactory: NamedClass })).toBe(Id.for(NamedClass));
  });
});
