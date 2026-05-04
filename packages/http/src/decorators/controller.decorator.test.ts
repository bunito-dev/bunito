import { describe, expect, it } from 'bun:test';
import { getComponentMetadata, getProviderMetadata } from '@bunito/container/internals';
import { Controller } from './controller.decorator';

describe('Controller', () => {
  it('stores controller metadata and request-scoped provider options', () => {
    @Controller('/api', { injects: ['dependency'] })
    class ExampleController {}

    expect(getComponentMetadata(ExampleController)?.get(Controller)?.value).toEqual({
      prefix: '/api',
    });
    expect(getProviderMetadata(ExampleController)?.options).toEqual({
      scope: 'request',
      injects: ['dependency'],
    });
  });

  it('accepts object and default controller options', () => {
    @Controller({
      prefix: '/object',
      scope: 'module',
    })
    class ObjectController {}

    @Controller()
    class DefaultController {}

    expect(getComponentMetadata(ObjectController)?.get(Controller)?.value).toEqual({
      prefix: '/object',
    });
    expect(getProviderMetadata(ObjectController)?.options).toEqual({
      scope: 'module',
    });
    expect(getComponentMetadata(DefaultController)?.get(Controller)?.value).toEqual({
      prefix: '/',
    });
  });
});
