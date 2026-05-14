import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { OnAppShutdown } from './on-app-shutdown';

describe('OnAppShutdown', () => {
  it('registers an app shutdown provider handler', () => {
    class AppProvider {
      @OnAppShutdown({ injects: ['dependency'] })
      shutdown(): void {
        //
      }
    }

    expect(
      getClassMetadata(AppProvider, 'provider')?.handlers?.get(OnAppShutdown),
    ).toEqual({
      propKey: 'shutdown',
      injects: ['dependency'],
    });
  });
});
