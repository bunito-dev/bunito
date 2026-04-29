import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '../metadata';
import { OnDestroy } from './on-destroy.decorator';

describe('OnDestroy', () => {
  it('registers a disposable provider handler', () => {
    class ExampleProvider {
      @OnDestroy({ injects: ['literal'] })
      destroy(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleProvider)?.handlers?.get(OnDestroy)).toEqual({
      propKey: 'destroy',
      options: {
        injects: ['literal'],
        disposable: true,
      },
    });
  });
});
