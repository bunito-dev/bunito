import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import {
  OnBoot,
  OnDestroy,
  OnInit,
  OnResolve,
  ProviderEvent,
} from './provider-event.decorator';
import { getDecoratorMetadata } from './utils';

describe('ProviderEvent', () => {
  it('stores provider event handlers and alias disposable flags', () => {
    class TestProvider {
      @OnBoot()
      boot(): void {
        //
      }

      @OnInit()
      init(): void {
        //
      }

      @OnResolve()
      resolve(): void {
        //
      }

      @OnDestroy()
      destroy(): void {
        //
      }
    }

    expect(getDecoratorMetadata(TestProvider, 'provider')?.events).toEqual({
      OnBoot: {
        disposable: true,
        propKey: 'boot',
      },
      OnInit: {
        disposable: true,
        propKey: 'init',
      },
      OnResolve: {
        disposable: false,
        propKey: 'resolve',
      },
      OnDestroy: {
        disposable: true,
        propKey: 'destroy',
      },
    });
  });

  it('rejects duplicate handlers for the same event', () => {
    expect(() => {
      class TestProvider {
        @ProviderEvent('OnInit')
        one(): void {
          //
        }

        @ProviderEvent('OnInit')
        two(): void {
          //
        }
      }

      return TestProvider;
    }).toThrow(ConfigurationException);
  });
});
