import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { CONTAINER_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata } from '../types';
import { Provider } from './provider';

describe('Provider', () => {
  it('should store provider metadata for the decorated class', () => {
    @Provider({
      scope: 'request',
      injects: ['dep'],
    })
    class TestProvider {}

    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        TestProvider,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'request',
      injects: ['dep'],
    });
  });
});
