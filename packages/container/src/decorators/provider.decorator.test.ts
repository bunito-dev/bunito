import { describe, expect, it } from 'bun:test';
import { Provider } from './provider.decorator';
import { getDecoratorMetadata } from './utils';

describe('Provider', () => {
  it('stores provider options on a class', () => {
    @Provider({
      scope: 'request',
      injects: ['dependency'],
    })
    class TestProvider {}

    expect(getDecoratorMetadata(TestProvider, 'provider')).toEqual({
      options: {
        scope: 'request',
        injects: ['dependency'],
      },
    });
  });

  it('keeps the latest provider options when applied more than once', () => {
    @Provider({
      injects: ['first'],
    })
    @Provider({
      scope: 'request',
    })
    class TestProvider {}

    expect(getDecoratorMetadata(TestProvider, 'provider')).toEqual({
      options: {
        injects: ['first'],
      },
    });
  });
});
