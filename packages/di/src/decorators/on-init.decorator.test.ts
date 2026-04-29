import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '../metadata';
import { OnInit } from './on-init.decorator';

describe('OnInit', () => {
  it('registers a disposable provider handler', () => {
    class ExampleProvider {
      @OnInit({ injects: ['literal'] })
      init(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleProvider)?.handlers?.get(OnInit)).toEqual({
      propKey: 'init',
      options: {
        injects: ['literal'],
        disposable: true,
      },
    });
  });
});
