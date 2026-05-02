import { describe, expect, it } from 'bun:test';
import { createProviderHandlerDecorator } from './create-provider-handler-decorator';
import { getProviderMetadata } from './get-provider-metadata';

function Handler() {
  return createProviderHandlerDecorator(Handler, {
    injects: ['dependency'],
  });
}

describe('createProviderHandlerDecorator', () => {
  it('stores provider handler metadata and rejects duplicates', () => {
    class ExampleProvider {
      @Handler()
      handle(): void {
        //
      }
    }

    expect(getProviderMetadata(ExampleProvider)?.handlers?.get(Handler)).toEqual({
      propKey: 'handle',
      injects: ['dependency'],
    });

    expect(() => {
      class DuplicateHandlerProvider {
        @Handler()
        first(): void {
          //
        }

        @Handler()
        second(): void {
          //
        }
      }

      return DuplicateHandlerProvider;
    }).toThrow('@Handler() decorator can only be applied once');
  });
});
