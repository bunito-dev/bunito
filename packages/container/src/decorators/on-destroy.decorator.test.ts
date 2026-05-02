import { describe, expect, it } from 'bun:test';
import { OnDestroy } from './on-destroy.decorator';
import { getProviderMetadata } from './utils';

describe('OnDestroy', () => {
  it('registers a provider destroy handler', () => {
    class ExampleProvider {
      @OnDestroy({ injects: ['dependency'] })
      destroy(): void {
        //
      }
    }

    expect(getProviderMetadata(ExampleProvider)?.handlers?.get(OnDestroy)).toEqual({
      propKey: 'destroy',
      injects: ['dependency'],
    });
  });
});
