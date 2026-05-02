import { describe, expect, it } from 'bun:test';
import { Provider } from '../provider.decorator';
import { getProviderMetadata } from './get-provider-metadata';

describe('getProviderMetadata', () => {
  it('reads provider metadata from classes and returns undefined otherwise', () => {
    @Provider({ scope: 'module' })
    class ExampleProvider {}

    class PlainClass {}

    expect(getProviderMetadata(ExampleProvider)?.options).toEqual({
      scope: 'module',
    });
    expect(getProviderMetadata(PlainClass)).toBeUndefined();
  });
});
