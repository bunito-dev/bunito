import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '../constants';
import { Provider } from './provider.decorator';

describe('Provider', () => {
  it('stores provider options metadata', () => {
    class Example {}

    const metadata = {} as DecoratorMetadata;

    Provider({ scope: 'request' })(Example, { metadata } as never);

    expect(metadata[DECORATOR_METADATA_KEYS.PROVIDER_OPTIONS]).toEqual({
      scope: 'request',
    });
  });
});
