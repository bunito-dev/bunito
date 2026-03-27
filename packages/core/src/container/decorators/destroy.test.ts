import { describe, expect, it } from 'bun:test';
import { PROVIDER_HOOK_METADATA_KEYS } from '../constants';
import { Destroy } from './destroy';

describe('Destroy', () => {
  it('should register destroy hook metadata', () => {
    const metadata: DecoratorMetadataObject = {};
    const decorator = Destroy();

    decorator(function destroy() {}, {
      metadata,
      name: 'destroy',
    } as ClassMethodDecoratorContext);

    expect(metadata[PROVIDER_HOOK_METADATA_KEYS.destroy]).toEqual(new Set(['destroy']));
  });
});
