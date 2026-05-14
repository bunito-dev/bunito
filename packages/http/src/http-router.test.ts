import { describe, expect, it } from 'bun:test';
import { ServerRouter } from '@bunito/bun/internals';
import { Container, getClassMetadata, Id } from '@bunito/container';
import { Logger } from '@bunito/logger';
import { z } from 'zod';
import { HTTPConfig } from './http-config';
import { HTTPRouter } from './http-router';
import { Body, Context, Method, Params, Query } from './injections';
import { Middleware } from './middleware';

class SerializerMiddleware implements Middleware {
  beforeRequest(context: { body?: unknown }): void {
    context.body = { from: 'middleware' };
  }

  serializeResponseData(data: unknown): Response {
    return Response.json(data);
  }

  serializeException(exception: { message: string }): Response {
    return Response.json({ error: exception.message }, { status: 599 });
  }
}

class FailingExceptionMiddleware implements Middleware {
  serializeException(): Response {
    throw new Error('serializer failed');
  }
}

class InvalidMiddleware {}

function createLogger(): {
  debug: unknown[][];
  setContext: () => undefined;
  warn: (...args: unknown[]) => number;
  warnings: unknown[][];
} {
  const warnings: unknown[][] = [];
  const debug: unknown[][] = [];

  return {
    warnings,
    debug,
    setContext: () => undefined,
    warn: (...args: unknown[]) => warnings.push(args),
  };
}

describe('HTTPRouter', () => {
  it('registers as a server router extension', () => {
    expect(getClassMetadata(HTTPRouter, 'provider')).toEqual({
      decorator: ServerRouter,
      options: {
        injects: [
          HTTPConfig,
          Container,
          {
            useToken: Middleware,
            optional: true,
          },
        ],
      },
    });
  });

  it('returns not found and not implemented responses for unmatched requests', async () => {
    const router = new HTTPRouter(
      {
        defaultResponseContentType: 'application/json',
      },
      {
        locateComponents: () => undefined,
      } as never,
    );

    const notFound = await router.processRequest(new Request('http://localhost'), {
      route: undefined,
    } as never);
    const notImplemented = await router.processRequest(new Request('http://localhost'), {
      route: {
        path: '/missing',
        method: 'GET',
        params: {},
      },
    } as never);

    expect(router.getRoutePaths()).toEqual([]);
    expect(notFound?.status).toBe(404);
    expect(notImplemented?.status).toBe(501);
  });

  it('runs middleware, resolves handler injections, serializes data, and destroys requests', async () => {
    const moduleId = Id.unique('Module');
    const providerId = Id.unique('Controller');
    const logger = createLogger();
    const controller = {
      handle: (
        params: unknown,
        query: unknown,
        body: unknown,
        method: unknown,
        context: unknown,
        url: unknown,
        request: unknown,
        headers: unknown,
      ) => ({
        params,
        query,
        body,
        method,
        context,
        url: url instanceof URL,
        request: request instanceof Request,
        headers: headers instanceof Headers,
      }),
    };
    const container = {
      locateComponents: () => ({
        moduleId,
        props: [
          {
            propKind: 'class',
            options: {
              kind: 'middleware',
              middleware: SerializerMiddleware,
              options: {},
            },
          },
        ],
        controllers: [
          {
            providerId,
            options: {
              prefix: '/api',
            },
            props: [
              {
                propKind: 'method',
                propKey: 'handle',
                options: {
                  kind: 'route',
                  options: {
                    method: 'POST',
                    path: '/items/:id',
                    injects: [
                      Params(z.object({ id: z.string() })),
                      Query(z.object({ q: z.string() })),
                      Body(),
                      Method(),
                      Context(),
                      URL,
                      Request,
                      Headers,
                    ],
                  },
                },
              },
            ],
          },
        ],
      }),
      tryResolveProvider: (token: unknown) => (token === Logger ? logger : undefined),
      resolveProvider: () => controller,
      resolveInjections: (
        injects: unknown[],
        options: { injectionResolver: (token: unknown, options?: unknown) => unknown },
      ) =>
        Promise.all(
          injects.map((inject: unknown) => {
            if (typeof inject === 'object' && inject && 'useToken' in inject) {
              return options.injectionResolver(
                inject.useToken,
                'options' in inject ? inject.options : undefined,
              );
            }

            return options.injectionResolver(inject);
          }),
        ),
    };
    const router = new HTTPRouter(
      {
        defaultResponseContentType: 'application/json',
      },
      container as never,
      [new SerializerMiddleware()],
    );

    const response = await router.processRequest(
      new Request('http://localhost/api/items/123?q=test', {
        method: 'POST',
      }),
      {
        route: {
          path: '/api/items/:id',
          method: 'POST',
          params: {
            id: '123',
          },
        },
      } as never,
    );

    expect(router.getRoutePaths()).toEqual(['/api/items/:id']);
    expect(response?.status).toBe(200);
    expect(await response?.json()).toEqual({
      params: {
        id: '123',
      },
      query: {
        q: 'test',
      },
      body: {
        from: 'middleware',
      },
      method: 'POST',
      context: expect.any(Object),
      url: true,
      request: true,
      headers: true,
    });
    expect(logger.warnings).toEqual([]);
  });

  it('passes Response handler results through unchanged', async () => {
    const moduleId = Id.unique('Module');
    const providerId = Id.unique('Controller');
    const router = new HTTPRouter(
      {
        defaultResponseContentType: 'application/json',
      },
      {
        locateComponents: () => ({
          moduleId,
          controllers: [
            {
              providerId,
              options: {},
              props: [
                {
                  propKind: 'method',
                  propKey: 'handle',
                  options: {
                    kind: 'route',
                    options: {
                      method: 'GET',
                      path: '/raw',
                    },
                  },
                },
              ],
            },
          ],
        }),
        tryResolveProvider: () => undefined,
        resolveProvider: () => ({
          handle: () => new Response('raw'),
        }),
      } as never,
    );

    const response = await router.processRequest(new Request('http://localhost/raw'), {
      route: {
        path: '/raw',
        method: 'GET',
        params: {},
      },
    } as never);

    expect(await response?.text()).toBe('raw');
  });

  it('serializes handler errors and serializer failures', async () => {
    const moduleId = Id.unique('Module');
    const providerId = Id.unique('Controller');
    const logger = createLogger();
    const createErrorContainer = (middleware: unknown) => ({
      locateComponents: () => ({
        moduleId,
        props: [
          {
            propKind: 'class',
            options: {
              kind: 'middleware',
              middleware,
              options: {},
            },
          },
        ],
        controllers: [
          {
            providerId,
            options: {},
            props: [
              {
                propKind: 'method',
                propKey: 'handle',
                options: {
                  kind: 'route',
                  options: {
                    method: 'GET',
                    path: '/boom',
                  },
                },
              },
            ],
          },
        ],
      }),
      tryResolveProvider: () => logger,
      resolveProvider: () => ({
        handle: () => {
          throw new Error('Missing');
        },
      }),
    });
    const serializedRouter = new HTTPRouter(
      {
        defaultResponseContentType: 'application/json',
      },
      createErrorContainer(SerializerMiddleware) as never,
      [new SerializerMiddleware()],
    );
    const fallbackRouter = new HTTPRouter(
      {
        defaultResponseContentType: 'application/json',
      },
      createErrorContainer(FailingExceptionMiddleware) as never,
      [new FailingExceptionMiddleware()],
    );
    const requestContext = {
      route: {
        path: '/boom',
        method: 'GET',
        params: {},
      },
    } as never;

    const serialized = await serializedRouter.processRequest(
      new Request('http://localhost/boom'),
      requestContext,
    );
    const fallback = await fallbackRouter.processRequest(
      new Request('http://localhost/boom'),
      requestContext,
    );

    expect(serialized?.status).toBe(599);
    expect(await serialized?.json()).toEqual({
      error: 'Internal Server Error',
    });
    expect(fallback?.status).toBe(500);
  });

  it('rejects invalid middleware, unavailable middleware, duplicate routes, and empty controllers', () => {
    const moduleId = Id.unique('Module');
    const providerId = Id.unique('Controller');

    expect(
      () =>
        new HTTPRouter(
          { defaultResponseContentType: 'application/json' },
          {
            locateComponents: () => undefined,
          } as never,
          [new InvalidMiddleware() as never],
        ),
    ).toThrow('is not a valid Middleware');

    expect(
      () =>
        new HTTPRouter({ defaultResponseContentType: 'application/json' }, {
          locateComponents: () => ({
            moduleId,
            props: [
              {
                propKind: 'class',
                options: {
                  kind: 'middleware',
                  middleware: SerializerMiddleware,
                  options: {},
                },
              },
            ],
          }),
        } as never),
    ).toThrow('is not available in the container');

    expect(
      () =>
        new HTTPRouter({ defaultResponseContentType: 'application/json' }, {
          locateComponents: () => ({
            moduleId,
            controllers: [
              {
                providerId,
                options: {},
                props: [
                  {
                    propKind: 'method',
                    propKey: 'a',
                    options: {
                      kind: 'route',
                      options: {
                        method: 'GET',
                        path: '/same',
                      },
                    },
                  },
                  {
                    propKind: 'method',
                    propKey: 'b',
                    options: {
                      kind: 'route',
                      options: {
                        method: 'GET',
                        path: '/same',
                      },
                    },
                  },
                ],
              },
            ],
          }),
        } as never),
    ).toThrow('Duplicate route GET /same detected');

    expect(
      () =>
        new HTTPRouter({ defaultResponseContentType: 'application/json' }, {
          locateComponents: () => ({
            moduleId,
            controllers: [
              {
                providerId,
                options: {},
                props: [],
              },
            ],
          }),
        } as never),
    ).toThrow('does not declare any routes');
  });

  it('serializes bad request and not found results when handlers return unusable data', async () => {
    const moduleId = Id.unique('Module');
    const providerId = Id.unique('Controller');
    const makeRouter = (handler: () => unknown) =>
      new HTTPRouter(
        {
          defaultResponseContentType: 'application/json',
        },
        {
          locateComponents: () => ({
            moduleId,
            controllers: [
              {
                providerId,
                options: {},
                props: [
                  {
                    propKind: 'method',
                    propKey: 'handle',
                    options: {
                      kind: 'route',
                      options: {
                        method: 'GET',
                        path: '/data',
                      },
                    },
                  },
                ],
              },
            ],
          }),
          tryResolveProvider: () => undefined,
          resolveProvider: () => ({
            handle: handler,
          }),
        } as never,
      );

    const requestContext = {
      route: {
        path: '/data',
        method: 'GET',
        params: {},
      },
    } as never;
    const badRequest = await makeRouter(() => ({ ok: true })).processRequest(
      new Request('http://localhost/data'),
      requestContext,
    );
    const notFound = await makeRouter(() => undefined).processRequest(
      new Request('http://localhost/data'),
      requestContext,
    );

    expect(badRequest?.status).toBe(400);
    expect(notFound?.status).toBe(404);
  });
});
