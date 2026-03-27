import { describe, expect, it } from 'bun:test';
import { PROVIDER_METADATA_KEY } from '../constants';
import { Controller } from './controller';

function createClassContext(metadata: DecoratorMetadataObject): ClassDecoratorContext {
  return { metadata } as ClassDecoratorContext;
}

describe('Controller', () => {
  it('should register the class as a request-scoped provider', () => {
    class TestController {}

    const metadata: DecoratorMetadataObject = {};

    Controller({
      injects: ['dep'],
    })(TestController, createClassContext(metadata));

    expect(metadata[PROVIDER_METADATA_KEY]).toEqual({
      scope: 'request',
      injects: ['dep'],
      useClass: TestController,
    });
  });
});
