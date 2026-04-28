import { describe, expect, it } from 'bun:test';
import { getClassDecoratorMetadata } from './metadata';
import { Provider } from './provider.decorator';

describe('Provider', () => {
  it('stores provider options on a class', () => {
    @Provider({ scope: 'module', token: 'provider-token' })
    class ExampleProvider {}

    expect(getClassDecoratorMetadata(ExampleProvider, Provider)?.options).toEqual({
      scope: 'module',
      token: 'provider-token',
    });
  });

  it('rejects duplicate provider decorators', () => {
    expect(() => {
      @Provider()
      @Provider()
      class DuplicateProvider {}

      return DuplicateProvider;
    }).toThrow('@Provider() decorator is already defined');
  });
});
