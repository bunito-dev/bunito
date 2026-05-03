import { describe, expect, it } from 'bun:test';
import { assignNonNullish } from './assign-non-nullish';

describe('assignNonNullish', () => {
  it('assigns only non-nullish source values to the target object', () => {
    const target = {
      enabled: true,
      label: 'default',
      count: 1,
    };

    const result = assignNonNullish(target, {
      enabled: false,
      label: undefined,
      count: null,
    } as unknown as Partial<typeof target>);

    expect(result).toBe(target);
    expect(result).toEqual({
      enabled: false,
      label: 'default',
      count: 1,
    });
  });

  it('returns the target object when the source is nullish', () => {
    const target = {
      enabled: true,
    };

    expect(assignNonNullish(target, undefined)).toBe(target);
    expect(assignNonNullish(target, null)).toBe(target);
  });
});
