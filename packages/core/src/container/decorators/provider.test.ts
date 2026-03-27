import { describe, expect, it } from 'bun:test';
import { PROVIDER_METADATA_KEY } from '../constants';
import { Provider } from './provider';

function createClassContext(metadata: DecoratorMetadataObject): ClassDecoratorContext {
  return { metadata } as ClassDecoratorContext;
}

describe('Provider', () => {
  it('should store provider metadata for the decorated class', () => {
    class TestProvider {}

    const metadata: DecoratorMetadataObject = {};

    Provider({
      scope: 'request',
      injects: ['dep'],
      token: 'token',
    })(TestProvider, createClassContext(metadata));

    expect(metadata[PROVIDER_METADATA_KEY]).toEqual({
      scope: 'request',
      injects: ['dep'],
      token: 'token',
      useClass: TestProvider,
    });
  });
});
