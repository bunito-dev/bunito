import { describe, expect, it } from 'bun:test';
import { createExtensionDecorator } from './create-extension-decorator';
import { getClassMetadata } from './get-class-metadata';

describe('createExtensionDecorator', () => {
  it('creates decorators that index providers by the extension decorator', () => {
    function Extension(options?: Parameters<typeof createExtensionDecorator>[1]) {
      return createExtensionDecorator(Extension, options);
    }

    @Extension({ scope: 'singleton' })
    class ExampleExtension {}

    expect(getClassMetadata(ExampleExtension, 'provider')).toEqual({
      decorator: Extension,
      options: {
        scope: 'singleton',
      },
    });
  });
});
