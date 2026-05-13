import { describe, expect, it } from 'bun:test';
import { Provider } from './provider';
import { getClassMetadata } from './utils';

describe('Provider', () => {
  it('stores provider metadata options', () => {
    @Provider({ scope: 'singleton' })
    class ExampleProvider {}

    expect(getClassMetadata(ExampleProvider, 'provider')).toEqual({
      decorator: Provider,
      options: {
        scope: 'singleton',
      },
    });
  });
});
