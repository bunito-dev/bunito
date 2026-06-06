import { describe, expect, it } from 'bun:test';
import { CustomInjection } from './custom-injection';

describe('CustomInjection', () => {
  it('creates a custom HTTP context injection token', () => {
    const resolver = () => 'value';

    expect(CustomInjection(resolver)).toEqual({
      useToken: CustomInjection,
      options: resolver,
    });
  });
});
