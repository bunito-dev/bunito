import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { Extension } from './extension.decorator';
import { getDecoratorMetadata } from './utils';

describe('Extension', () => {
  it('stores extension metadata and provider metadata', () => {
    const key = Symbol('extension');

    @Extension('Plugin', key, 'json')
    class TestExtension {}

    expect(getDecoratorMetadata(TestExtension, 'extension')).toEqual({
      key,
      options: 'json',
    });
    expect(getDecoratorMetadata(TestExtension, 'provider')).toEqual({
      options: {},
    });
  });

  it('rejects duplicate extension decorators', () => {
    const key = Symbol('extension');

    expect(() => {
      @Extension('Plugin', key)
      @Extension('Plugin', key)
      class TestExtension {}

      return TestExtension;
    }).toThrow(ConfigurationException);
  });
});
