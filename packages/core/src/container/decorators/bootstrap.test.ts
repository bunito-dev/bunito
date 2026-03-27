import { describe, expect, it } from 'bun:test';
import { PROVIDER_HOOK_METADATA_KEYS } from '../constants';
import { Bootstrap } from './bootstrap';

describe('Bootstrap', () => {
  it('should register bootstrap hook metadata', () => {
    const metadata: DecoratorMetadataObject = {};
    const decorator = Bootstrap();

    decorator(function bootstrap() {}, {
      metadata,
      name: 'bootstrap',
    } as ClassMethodDecoratorContext);

    expect(metadata[PROVIDER_HOOK_METADATA_KEYS.bootstrap]).toEqual(
      new Set(['bootstrap']),
    );
  });
});
