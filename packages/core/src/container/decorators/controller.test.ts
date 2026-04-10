import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import { CONTAINER_METADATA_KEYS } from '../constants';
import type { ClassProviderMetadata } from '../types';
import { Controller } from './controller';

describe('Controller', () => {
  it('should register controller and provider metadata with request scope by default', () => {
    @Controller({
      injects: ['dep'],
    })
    class TestController {}

    expect(
      getDecoratorMetadata(TestController, CONTAINER_METADATA_KEYS.CONTROLLER),
    ).toBeTrue();
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        TestController,
        CONTAINER_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      scope: 'request',
      injects: ['dep'],
    });
  });
});
