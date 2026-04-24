import { describe, expect, it } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/container/internals';
import { CONTROLLER_COMPONENT } from '../constants';
import { Controller } from './controller.decorator';

describe('Controller', () => {
  it('registers request-scoped controller metadata from a prefix string', () => {
    @Controller('/users', {
      injects: ['dependency'],
    })
    class UsersController {}

    expect(
      getDecoratorMetadata(UsersController, 'components')?.get(CONTROLLER_COMPONENT),
    ).toEqual({
      kind: 'prefix',
      prefix: '/users',
    });
    expect(getDecoratorMetadata(UsersController, 'provider')).toEqual({
      options: {
        scope: 'request',
        injects: ['dependency'],
      },
    });
  });

  it('registers controller metadata from options', () => {
    @Controller({
      prefix: '/api',
    })
    class ApiController {}

    expect(
      getDecoratorMetadata(ApiController, 'components')?.get(CONTROLLER_COMPONENT),
    ).toEqual({
      kind: 'prefix',
      prefix: '/api',
    });
  });
});
