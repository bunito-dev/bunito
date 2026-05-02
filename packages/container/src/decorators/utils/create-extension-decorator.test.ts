import { describe, expect, it } from 'bun:test';
import { Module } from '../module.decorator';
import { Provider } from '../provider.decorator';
import { createExtensionDecorator } from './create-extension-decorator';
import { getProviderMetadata } from './get-provider-metadata';

function Extension(options?: Parameters<typeof createExtensionDecorator>[1]) {
  return createExtensionDecorator(Extension, options);
}

function OtherExtension(options?: Parameters<typeof createExtensionDecorator>[1]) {
  return createExtensionDecorator(OtherExtension, options);
}

describe('createExtensionDecorator', () => {
  it('stores extension provider metadata', () => {
    @Extension({ scope: 'singleton', injects: ['dependency'] })
    class ExampleExtension {}

    expect(getProviderMetadata(ExampleExtension)).toEqual({
      decorator: Extension,
      options: {
        scope: 'singleton',
        injects: ['dependency'],
      },
    });
  });

  it('rejects conflicts with modules, providers, and other extensions', () => {
    expect(() => {
      @Extension()
      @Module()
      class ModuleConflict {}

      return ModuleConflict;
    }).toThrow('@Extension() decorator conflicts with @Module() decorator');

    expect(() => {
      @Extension()
      @Provider()
      class ProviderConflict {}

      return ProviderConflict;
    }).toThrow('@Extension() decorator conflicts with @Provider() decorator');

    expect(() => {
      @Extension()
      @OtherExtension()
      class ExtensionConflict {}

      return ExtensionConflict;
    }).toThrow('@Extension() decorator conflicts with @OtherExtension() decorator');

    expect(() => {
      @Extension()
      @Extension()
      class DuplicateExtension {}

      return DuplicateExtension;
    }).toThrow('@Extension() decorator can only be applied once');
  });
});
