import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '../metadata';
import { Provider } from './provider.decorator';

describe('Provider', () => {
  it('stores provider options on a class', () => {
    @Provider({ scope: 'module', group: Symbol.for('provider-group') })
    class ExampleProvider {}

    expect(getClassMetadata(ExampleProvider)?.options?.get(Provider)).toEqual({
      scope: 'module',
      group: Symbol.for('provider-group'),
    });
  });

  it('rejects duplicate provider decorators', () => {
    expect(() => {
      @Provider()
      @Provider()
      class DuplicateProvider {}

      return DuplicateProvider;
    }).toThrow('@Provider decorator can only be used once');
  });
});
