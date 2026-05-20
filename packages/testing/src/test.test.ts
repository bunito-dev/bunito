import { describe, expect, it } from 'bun:test';
import type { RawObject } from '@bunito/common';
import { Test } from './test';
import { TestException } from './test-exception';
import { defineTestFactory } from './utils';

describe('Test', () => {
  it('creates and caches values from registered factories', () => {
    let calls = 0;
    const registerFactory = defineTestFactory as unknown as (
      key: string,
      factory: (this: Record<string, unknown>) => unknown,
    ) => void;
    const context = Test as unknown as Record<string, unknown>;

    registerFactory('cached', function cachedFactory() {
      calls += 1;

      return {
        calls,
        previous: this.cached,
      };
    });

    expect(context.cached).toEqual({
      calls: 1,
      previous: undefined,
    });
    expect(context.cached).toBe(context.cached);
    expect(calls).toBe(1);
  });

  it('rejects writes and missing context keys', () => {
    expect(() => {
      (Test as Record<string, unknown>).value = true;
    }).toThrow(new TestException('Cannot set property on test context'));
    expect(() => (Test as RawObject).missing).toThrow(
      new TestException('Test context key "missing" is not defined'),
    );
  });
});
