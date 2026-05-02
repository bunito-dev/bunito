import { describe, expect, it } from 'bun:test';
import { getProviderMetadata } from '@bunito/container/internals';
import { OnAppStart } from './on-app-start.decorator';

describe('OnAppStart', () => {
  it('registers an app start provider handler', () => {
    class AppProvider {
      @OnAppStart({ injects: ['dependency'] })
      start(): void {
        //
      }
    }

    expect(getProviderMetadata(AppProvider)?.handlers?.get(OnAppStart)).toEqual({
      propKey: 'start',
      injects: ['dependency'],
    });
  });
});
