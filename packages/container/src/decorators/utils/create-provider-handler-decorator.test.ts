import { describe, expect, it } from 'bun:test';
import { createProviderHandlerDecorator } from './create-provider-handler-decorator';
import { getClassMetadata } from './get-class-metadata';

describe('createProviderHandlerDecorator', () => {
  it('creates provider handler decorators and rejects duplicates', () => {
    function Handler() {
      return createProviderHandlerDecorator(Handler, { injects: ['dep'] });
    }

    class ExampleProvider {
      @Handler()
      handle(): void {
        //
      }
    }

    expect(getClassMetadata(ExampleProvider, 'provider')?.handlers?.get(Handler)).toEqual(
      {
        propKey: 'handle',
        injects: ['dep'],
      },
    );

    expect(() => {
      class DuplicateProvider {
        @Handler()
        @Handler()
        handle(): void {
          //
        }
      }

      return DuplicateProvider;
    }).toThrow('@Handler() decorator can only be applied once');
  });
});
