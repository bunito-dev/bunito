import { describe, expect, it } from 'bun:test';
import { OnInit } from './on-init';
import { getClassMetadata } from './utils';

describe('OnInit', () => {
  it('registers an init provider handler', () => {
    class ProviderWithInit {
      @OnInit({ injects: ['init'] })
      onInit(): void {
        //
      }
    }

    expect(getClassMetadata(ProviderWithInit, 'provider')?.handlers?.get(OnInit)).toEqual(
      {
        propKey: 'onInit',
        injects: ['init'],
      },
    );
  });
});
