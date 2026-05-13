import { describe, expect, it } from 'bun:test';
import { Controller } from './controller';
import { getClassMetadata } from './utils';

describe('Controller', () => {
  it('stores controller metadata from a prefix string', () => {
    @Controller('/api', { injects: ['dep'] })
    class ExampleController {}

    expect(getClassMetadata(ExampleController, 'controller')).toEqual({
      prefix: '/api',
    });
    expect(getClassMetadata(ExampleController, 'provider')).toEqual({
      decorator: Controller,
      options: {
        scope: 'request',
        injects: ['dep'],
      },
    });
  });

  it('stores controller metadata from an options object', () => {
    @Controller({ prefix: '/api', scope: 'singleton' })
    class ExampleController {}

    expect(getClassMetadata(ExampleController, 'controller')).toEqual({
      prefix: '/api',
    });
    expect(getClassMetadata(ExampleController, 'provider')).toEqual({
      decorator: Controller,
      options: {
        scope: 'singleton',
      },
    });
  });
});
