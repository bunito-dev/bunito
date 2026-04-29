import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '../metadata';
import { OnResolve } from './on-resolve.decorator';

describe('OnResolve', () => {
  it('registers a reusable provider handler', () => {
    class ExampleProvider {
      @OnResolve({ injects: ['literal'] })
      resolved(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleProvider)?.handlers?.get(OnResolve)).toEqual({
      propKey: 'resolved',
      options: {
        injects: ['literal'],
      },
    });
  });
});
