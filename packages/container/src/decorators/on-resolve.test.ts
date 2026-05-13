import { describe, expect, it } from 'bun:test';
import { OnResolve } from './on-resolve';
import { getClassMetadata } from './utils';

describe('OnResolve', () => {
  it('registers a resolve provider handler', () => {
    class ProviderWithResolve {
      @OnResolve({ injects: ['resolve'] })
      onResolve(): void {
        //
      }
    }

    expect(
      getClassMetadata(ProviderWithResolve, 'provider')?.handlers?.get(OnResolve),
    ).toEqual({
      propKey: 'onResolve',
      injects: ['resolve'],
    });
  });
});
