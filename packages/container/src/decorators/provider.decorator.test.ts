import { describe, expect, it } from 'bun:test';
import { Module } from './module.decorator';
import { Provider } from './provider.decorator';
import { createExtensionDecorator, getProviderMetadata } from './utils';

function Extension(options?: Parameters<typeof createExtensionDecorator>[1]) {
  return createExtensionDecorator(Extension, options);
}

describe('Provider', () => {
  it('stores provider options on a class', () => {
    @Provider({ scope: 'module', injects: ['dependency'] })
    class ExampleProvider {}

    expect(getProviderMetadata(ExampleProvider)?.options).toEqual({
      scope: 'module',
      injects: ['dependency'],
    });
  });

  it('rejects duplicate provider decorators and module conflicts', () => {
    expect(() => {
      @Provider()
      @Provider()
      class DuplicateProvider {}

      return DuplicateProvider;
    }).toThrow('@Provider() decorator can only be applied once');

    expect(() => {
      @Provider()
      @Module()
      class ConflictingProvider {}

      return ConflictingProvider;
    }).toThrow('@Provider() decorator conflicts with @Module() decorator');

    expect(() => {
      @Provider()
      @Extension()
      class ExtensionConflict {}

      return ExtensionConflict;
    }).toThrow('@Provider() decorator conflicts with @Extension() decorator');
  });
});
