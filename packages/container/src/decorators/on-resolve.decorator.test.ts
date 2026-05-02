import { describe, expect, it } from 'bun:test';
import { OnResolve } from './on-resolve.decorator';
import { getProviderMetadata } from './utils';

describe('OnResolve', () => {
  it('registers a provider resolve handler', () => {
    class ExampleProvider {
      @OnResolve({ injects: ['dependency'] })
      resolve(): void {
        //
      }
    }

    expect(getProviderMetadata(ExampleProvider)?.handlers?.get(OnResolve)).toEqual({
      propKey: 'resolve',
      injects: ['dependency'],
    });
  });
});
