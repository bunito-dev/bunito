import { describe, expect, it } from 'bun:test';
import { OnInit } from './on-init.decorator';
import { getProviderMetadata } from './utils';

describe('OnInit', () => {
  it('registers a provider init handler', () => {
    class ExampleProvider {
      @OnInit({ injects: ['dependency'] })
      init(): void {
        //
      }
    }

    expect(getProviderMetadata(ExampleProvider)?.handlers?.get(OnInit)).toEqual({
      propKey: 'init',
      injects: ['dependency'],
    });
  });
});
