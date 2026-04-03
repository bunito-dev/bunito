import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata } from '../types';
import { Controller } from './controller';

describe('Controller', () => {
  it('should register controller and provider metadata with request scope by default', () => {
    class TestController {}
    const metadata = {} as DecoratorMetadataObject;

    Controller({
      injects: ['dep'],
    })(TestController, { metadata } as ClassDecoratorContext);

    expect(metadata[DECORATOR_METADATA_KEYS.controller]).toBeTrue();
    expect(metadata[DECORATOR_METADATA_KEYS.provider] as ClassProviderMetadata).toEqual({
      scope: 'request',
      injects: ['dep'],
    });
  });
});
