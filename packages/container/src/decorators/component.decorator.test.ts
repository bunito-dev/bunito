import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { Component } from './component.decorator';
import { getDecoratorMetadata } from './utils';

describe('Component', () => {
  it('stores component metadata and optional provider metadata', () => {
    const key = Symbol('component');

    @Component('Widget', key, { enabled: true }, { scope: 'request' })
    class TestComponent {}

    expect(getDecoratorMetadata(TestComponent, 'components')?.get(key)).toEqual({
      enabled: true,
    });
    expect(getDecoratorMetadata(TestComponent, 'provider')).toEqual({
      options: {
        scope: 'request',
      },
    });
  });

  it('rejects duplicate component decorators', () => {
    const key = Symbol('component');

    expect(() => {
      @Component('Widget', key)
      @Component('Widget', key)
      class TestComponent {}

      return TestComponent;
    }).toThrow(ConfigurationException);
  });
});
