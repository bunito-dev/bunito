import { describe, expect, it } from 'bun:test';
import { Module } from '../module.decorator';
import { Provider } from '../provider.decorator';
import { getDecoratorMetadata } from './get-decorator-metadata';

describe('getDecoratorMetadata', () => {
  it('reads decorator metadata by kind', () => {
    @Module({
      providers: [],
    })
    class TestModule {}

    expect(getDecoratorMetadata(TestModule, 'module')).toEqual({
      providers: [],
    });
  });

  it('returns undefined when metadata is missing', () => {
    class TestClass {}

    expect(getDecoratorMetadata(TestClass, 'provider')).toBeUndefined();
  });

  it('reads provider metadata independently from module metadata', () => {
    @Provider({
      token: 'token',
    })
    @Module()
    class TestClass {}

    expect(getDecoratorMetadata(TestClass, 'provider')).toEqual({
      options: {
        token: 'token',
      },
    });
  });
});
