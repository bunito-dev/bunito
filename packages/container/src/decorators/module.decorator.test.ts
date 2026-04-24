import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { Module } from './module.decorator';
import { getDecoratorMetadata } from './utils';

describe('Module', () => {
  it('stores module metadata and optional provider injects', () => {
    @Module({
      imports: [],
      providers: [
        {
          token: 'token',
          useValue: 1,
        },
      ],
      exports: ['token'],
      injects: ['dependency'],
    })
    class TestModule {}

    expect(getDecoratorMetadata(TestModule, 'module')).toEqual({
      imports: [],
      providers: [
        {
          token: 'token',
          useValue: 1,
        },
      ],
      exports: ['token'],
    });
    expect(getDecoratorMetadata(TestModule, 'provider')).toEqual({
      options: {
        injects: ['dependency'],
      },
    });
  });

  it('rejects duplicate module decorators', () => {
    expect(() => {
      @Module()
      @Module()
      class TestModule {}

      return TestModule;
    }).toThrow(ConfigurationException);
  });
});
