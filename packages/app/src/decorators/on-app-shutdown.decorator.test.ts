import { describe, expect, it } from 'bun:test';
import { getProviderMetadata } from '@bunito/container/internals';
import { OnAppShutdown } from './on-app-shutdown.decorator';

describe('OnAppShutdown', () => {
  it('registers an app shutdown provider handler', () => {
    class AppProvider {
      @OnAppShutdown({ injects: ['dependency'] })
      shutdown(): void {
        //
      }
    }

    expect(getProviderMetadata(AppProvider)?.handlers?.get(OnAppShutdown)).toEqual({
      propKey: 'shutdown',
      injects: ['dependency'],
    });
  });
});
