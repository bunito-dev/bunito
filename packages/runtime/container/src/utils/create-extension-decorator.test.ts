import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { createExtensionDecorator } from './create-extension-decorator';

const EXTENSION_KEY = Symbol('extension');

describe('createExtensionDecorator', () => {
  it('stores extension metadata and default provider options', () => {
    class Example {}

    const metadata = {} as DecoratorMetadata;

    createExtensionDecorator(EXTENSION_KEY, 'main', { scope: 'request' })(Example, {
      metadata,
    } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.EXTENSION_KEY]).toBe(EXTENSION_KEY);
    expect(metadata[DECORATOR_METADATA_KEYS.EXTENSION_OPTIONS]).toBe('main');
    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'request',
    });
  });
});
