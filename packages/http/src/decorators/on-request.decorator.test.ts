import { describe, expect, it } from 'bun:test';
import { DECORATOR_METADATA_KEYS } from '@bunito/core/container';
import { HTTP_CONTROLLER } from '../constants';
import { OnDelete, OnGet, OnPost, OnPut, OnRequest } from './on-request.decorator';

describe('OnRequest', () => {
  it('stores request handler metadata with defaults', () => {
    const metadata = {} as DecoratorMetadata;

    OnRequest()(() => undefined, {
      metadata,
      name: 'handle',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        HTTP_CONTROLLER,
      ),
    ).toEqual([
      {
        propKey: 'handle',
        options: {
          kind: 'onRequest',
          path: '/',
          method: 'ALL',
          schema: null,
        },
      },
    ]);
  });
});

describe('OnGet', () => {
  it('stores GET route metadata through the request decorator alias', () => {
    const metadata = {} as DecoratorMetadata;

    OnGet('/users')(() => undefined, {
      metadata,
      name: 'list',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        HTTP_CONTROLLER,
      ),
    ).toEqual([
      {
        propKey: 'list',
        options: {
          kind: 'onRequest',
          path: '/users',
          method: 'GET',
          schema: undefined,
        },
      },
    ]);
  });
});

describe('OnPost', () => {
  it('stores POST route metadata through the request decorator alias', () => {
    const metadata = {} as DecoratorMetadata;

    OnPost('/users')(() => undefined, {
      metadata,
      name: 'create',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        HTTP_CONTROLLER,
      ),
    ).toEqual([
      {
        propKey: 'create',
        options: {
          kind: 'onRequest',
          path: '/users',
          method: 'POST',
          schema: undefined,
        },
      },
    ]);
  });
});

describe('OnPut', () => {
  it('stores PUT route metadata through the request decorator alias', () => {
    const metadata = {} as DecoratorMetadata;

    OnPut('/users/:id')(() => undefined, {
      metadata,
      name: 'update',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        HTTP_CONTROLLER,
      ),
    ).toEqual([
      {
        propKey: 'update',
        options: {
          kind: 'onRequest',
          path: '/users/:id',
          method: 'PUT',
          schema: undefined,
        },
      },
    ]);
  });
});

describe('OnDelete', () => {
  it('stores DELETE route metadata through the request decorator alias', () => {
    const metadata = {} as DecoratorMetadata;

    OnDelete('/users/:id')(() => undefined, {
      metadata,
      name: 'remove',
    } as never);

    expect(
      (metadata[DECORATOR_METADATA_KEYS.COMPONENT_METHODS] as Map<symbol, unknown[]>).get(
        HTTP_CONTROLLER,
      ),
    ).toEqual([
      {
        propKey: 'remove',
        options: {
          kind: 'onRequest',
          path: '/users/:id',
          method: 'DELETE',
          schema: undefined,
        },
      },
    ]);
  });
});
