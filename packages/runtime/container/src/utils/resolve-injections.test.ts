import { describe, expect, it } from 'bun:test';
import { Id } from '../id';
import { resolveInjections } from './resolve-injections';

describe('resolveInjections', () => {
  it('resolves plain, optional and defaulted injections', () => {
    expect(
      resolveInjections([
        'plain',
        { token: 'optional', optional: true },
        { token: 'defaulted', defaultValue: 123 },
      ]),
    ).toEqual([
      { providerId: Id.for('plain'), defaultValue: undefined },
      { providerId: Id.for('optional'), defaultValue: null },
      { providerId: Id.for('defaulted'), defaultValue: 123 },
    ]);
  });

  it('returns an empty array when injections are missing', () => {
    expect(resolveInjections(undefined)).toEqual([]);
  });
});
