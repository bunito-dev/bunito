import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata } from '../types';
import { Provider } from './provider';

describe('Provider', () => {
  it('should store provider metadata for the decorated class', () => {
    class TestProvider {}
    const metadata = {} as DecoratorMetadataObject;

    Provider({
      scope: 'request',
      injects: ['dep'],
      token: 'token',
    })(TestProvider, { metadata } as ClassDecoratorContext);

    expect(metadata[DECORATOR_METADATA_KEYS.provider] as ClassProviderMetadata).toEqual({
      scope: 'request',
      injects: ['dep'],
      token: 'token',
    });
  });
});
