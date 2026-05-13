import { describe, expect, it } from 'bun:test';
import { OnDestroy } from './on-destroy';
import { getClassMetadata } from './utils';

describe('OnDestroy', () => {
  it('registers a destroy provider handler', () => {
    class ProviderWithDestroy {
      @OnDestroy({ injects: ['destroy'] })
      onDestroy(): void {
        //
      }
    }

    expect(
      getClassMetadata(ProviderWithDestroy, 'provider')?.handlers?.get(OnDestroy),
    ).toEqual({
      propKey: 'onDestroy',
      injects: ['destroy'],
    });
  });
});
