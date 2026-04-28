import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './metadata';
import { OnInit } from './on-init.decorator';
import { Provider } from './provider.decorator';

describe('OnInit', () => {
  it('registers a disposable provider handler', () => {
    class ExampleProvider {
      @OnInit({ injects: ['literal'] })
      init(): void {
        //
      }
    }

    expect(
      getClassDecoratorMetadata(ExampleProvider, Provider)?.handlers?.get(OnInit),
    ).toEqual({
      propKey: 'init',
      options: {
        injects: ['literal'],
        disposable: true,
      },
    });
  });
});
