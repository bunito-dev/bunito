import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './metadata';
import { OnResolve } from './on-resolve.decorator';
import { Provider } from './provider.decorator';

describe('OnResolve', () => {
  it('registers a reusable provider handler', () => {
    class ExampleProvider {
      @OnResolve({ injects: ['literal'] })
      resolved(): void {
        //
      }
    }

    expect(
      getClassDecoratorMetadata(ExampleProvider, Provider)?.handlers?.get(OnResolve),
    ).toEqual({
      propKey: 'resolved',
      options: {
        injects: ['literal'],
      },
    });
  });
});
