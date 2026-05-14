import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container';
import { OnAppStart } from './on-app-start';

describe('OnAppStart', () => {
  it('registers an app start provider handler', () => {
    class AppProvider {
      @OnAppStart({ injects: ['dependency'] })
      start(): void {
        //
      }
    }

    expect(getClassMetadata(AppProvider, 'provider')?.handlers?.get(OnAppStart)).toEqual({
      propKey: 'start',
      injects: ['dependency'],
    });
  });
});
