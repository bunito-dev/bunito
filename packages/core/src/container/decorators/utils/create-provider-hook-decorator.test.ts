import { describe, expect, it } from 'bun:test';
import { PROVIDER_HOOK_METADATA_KEYS } from '../../constants';
import { createProviderHookDecorator } from './create-provider-hook-decorator';

function createMethodContext(
  metadata: DecoratorMetadataObject,
  name: PropertyKey,
): ClassMethodDecoratorContext {
  return {
    metadata,
    name,
  } as ClassMethodDecoratorContext;
}

describe('createProviderHookDecorator', () => {
  it('should append method names under the selected hook metadata key', () => {
    const metadata: DecoratorMetadataObject = {};
    const decorator = createProviderHookDecorator('setup')();
    const first = function first() {};
    const second = function second() {};

    decorator(first, createMethodContext(metadata, 'onSetup'));
    decorator(second, createMethodContext(metadata, 'afterSetup'));

    expect(metadata[PROVIDER_HOOK_METADATA_KEYS.setup]).toEqual(
      new Set(['onSetup', 'afterSetup']),
    );
  });
});
