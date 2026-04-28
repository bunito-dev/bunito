import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './metadata';
import { OnDestroy } from './on-destroy.decorator';
import { Provider } from './provider.decorator';

describe('OnDestroy', () => {
  it('registers a disposable provider handler', () => {
    class ExampleProvider {
      @OnDestroy({ injects: ['literal'] })
      destroy(): void {
        //
      }
    }

    expect(
      getClassDecoratorMetadata(ExampleProvider, Provider)?.handlers?.get(OnDestroy),
    ).toEqual({
      propKey: 'destroy',
      options: {
        injects: ['literal'],
        disposable: true,
      },
    });
  });
});
