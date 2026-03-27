import { describe, expect, it } from 'bun:test';
import { PROVIDER_HOOK_METADATA_KEYS } from '../constants';
import { Setup } from './setup';

describe('Setup', () => {
  it('should register setup hook metadata', () => {
    const metadata: DecoratorMetadataObject = {};
    const decorator = Setup();

    decorator(function setup() {}, {
      metadata,
      name: 'setup',
    } as ClassMethodDecoratorContext);

    expect(metadata[PROVIDER_HOOK_METADATA_KEYS.setup]).toEqual(new Set(['setup']));
  });
});
