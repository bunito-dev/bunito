import { describe, expect, it } from 'bun:test';
import type { RequestContext } from '@bunito/bun/internals';
import type { Class, RawObject } from '@bunito/common';
import type { Container } from '@bunito/container';
import type {
  ComponentEntity,
  InjectionLike,
  MatchedComponents,
  ResolveProviderOptions,
  TokenLike,
} from '@bunito/container/internals';
import { Id } from '@bunito/container/internals';
import type { Logger } from '@bunito/logger';
import { z } from 'zod';
import { BadRequestException } from './exceptions';
import { HTTPRouter } from './http-router';
import { HTTPRouterException } from './http-router.exception';
import { Body, Context, Method, Params, Query } from './injections';
import type { Middleware, MiddlewareContext } from './middleware';
import type {
  ControllerClassOptions,
  ControllerMethodOptions,
  ControllerOptions,
  HTTPContentType,
  HTTPPath,
} from './types';

type HTTPMatchedComponents = MatchedComponents<
  ControllerOptions,
  {
    class: ControllerClassOptions;
    method: ControllerMethodOptions;
  }
>;

class FakeContainer {
  destroyedRequests: Id[] = [];

  logger: Logger | undefined;

  components: HTTPMatchedComponents | undefined;

  providers = new Map<string, unknown>();

  locateComponents(): HTTPMatchedComponents | undefined {
    return this.components;
  }

  async tryResolveProvider(): Promise<Logger | undefined> {
    return this.logger;
  }

  async resolveProvider(token: TokenLike): Promise<unknown> {
    return this.providers.get(Id.for(token).toString());
  }

  async resolveInjections(
    injections: InjectionLike[],
    options: ResolveProviderOptions,
  ): Promise<unknown[]> {
    const result: unknown[] = [];

    for (const injection of injections) {
      if (typeof injection === 'object' && 'useToken' in injection) {
        result.push(
          await options.injectionResolver?.(injection.useToken, injection.options),
        );
      } else {
        result.push(await options.injectionResolver?.(injection));
      }
    }

    return result;
  }

  async destroyRequest(requestId: Id): Promise<void> {
    this.destroyedRequests.push(requestId);
  }
}

function createLogger(): {
  logger: Logger;
  events: string[];
} {
  const events: string[] = [];

  return {
    events,
    logger: {
      setContext: (context: unknown) => events.push(`context:${String(context)}`),
      trace: () => ({
        debug: (message: string, data?: unknown) =>
          events.push(`debug:${message}:${JSON.stringify(data)}`),
        warn: (error: unknown) => events.push(`warn:${String(error)}`),
      }),
    } as unknown as Logger,
  };
}

function createComponent(
  controller: Class,
  props: ComponentEntity<
    ControllerOptions,
    {
      class: ControllerClassOptions;
      method: ControllerMethodOptions;
    }
  >['options']['props'],
  prefix: HTTPPath = '/api',
): ComponentEntity<
  ControllerOptions,
  {
    class: ControllerClassOptions;
    method: ControllerMethodOptions;
  }
> {
  return {
    useProvider: Id.for(controller),
    options: {
      value: {
        prefix,
      },
      props,
    },
  };
}

function createRouter(
  components: HTTPMatchedComponents | undefined,
  providers: [TokenLike, unknown][],
  middleware: Middleware<RawObject>[] | null = null,
  responseContentType?: HTTPContentType,
): {
  container: FakeContainer;
  router: HTTPRouter;
} {
  const container = new FakeContainer();
  container.components = components;

  for (const [token, instance] of providers) {
    container.providers.set(Id.for(token).toString(), instance);
  }

  return {
    container,
    router: new HTTPRouter(
      {
        responseContentType,
      },
      container as unknown as Container,
      middleware,
    ),
  };
}

function createContext(path?: string, method = 'GET'): RequestContext {
  return {
    route: path
      ? {
          path,
          method: method as never,
          params: {
            id: '42',
          },
        }
      : undefined,
    upgrade: () => false,
  };
}

async function read(response: Response | undefined): Promise<{
  status: number;
  body: unknown;
}> {
  expect(response).toBeInstanceOf(Response);

  return {
    status: response?.status ?? 0,
    body: await response?.json(),
  };
}

describe('HTTPRouter', () => {
  it('returns registered route paths', () => {
    class ExampleController {
      get(): Response {
        return new Response('ok');
      }
    }

    const { router } = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(ExampleController, [
            {
              propKind: 'method',
              propKey: 'get',
              value: {
                kind: 'route',
                options: {
                  path: '/items',
                  method: 'GET',
                },
              },
            },
          ]),
        ],
      },
      [[ExampleController, new ExampleController()]],
    );

    expect(router.getRoutePaths()).toEqual(['/api/items']);
  });

  it('returns not found and not implemented responses for missing route matches', async () => {
    class ExampleController {
      get(): Response {
        return new Response('ok');
      }
    }

    const { router } = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(ExampleController, [
            {
              propKind: 'method',
              propKey: 'get',
              value: {
                kind: 'route',
                options: {
                  path: '/items',
                  method: 'GET',
                },
              },
            },
          ]),
        ],
      },
      [[ExampleController, new ExampleController()]],
      null,
      'text/plain',
    );

    const missingContextResponse = await router.processRequest(
      new Request('http://localhost/api/items'),
      createContext(),
    );
    const missingMethodResponse = await router.processRequest(
      new Request('http://localhost/api/items'),
      createContext('/api/items', 'POST'),
    );

    expect(missingContextResponse?.status).toBe(404);
    expect(await missingContextResponse?.text()).toBe('Not Found');
    expect(missingMethodResponse?.status).toBe(501);
    expect(await missingMethodResponse?.text()).toBe('Not Implemented');
  });

  it('resolves controller injections and destroys request scoped instances', async () => {
    const schema = z.object({
      id: z.string(),
    });
    class ExampleController {
      get(
        context: Context,
        params: Params,
        query: Query,
        body: Body,
        method: Method,
        url: URL,
        request: Request,
        headers: Headers,
      ): Response {
        return Response.json({
          context: context.params.id,
          params,
          query,
          body,
          method,
          url: url.pathname,
          request: request.url,
          headers: headers.get('x-test'),
        });
      }
    }
    const { logger, events } = createLogger();
    const { router, container } = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(ExampleController, [
            {
              propKind: 'method',
              propKey: 'get',
              value: {
                kind: 'route',
                options: {
                  path: '/items',
                  method: 'GET',
                  injects: [
                    Context(),
                    Params(schema),
                    Query(),
                    Body(),
                    Method(),
                    URL,
                    Request,
                    Headers,
                  ],
                },
              },
            },
          ]),
        ],
      },
      [[ExampleController, new ExampleController()]],
    );
    container.logger = logger;

    const response = await router.processRequest(
      new Request('http://localhost/api/items?tag=a&tag=b', {
        headers: {
          'x-test': 'yes',
        },
      }),
      createContext('/api/items'),
    );

    expect(await read(response)).toEqual({
      status: 200,
      body: {
        context: '42',
        params: {
          id: '42',
        },
        query: {
          tag: ['a', 'b'],
        },
        body: null,
        method: 'GET',
        url: '/api/items',
        request: 'http://localhost/api/items?tag=a&tag=b',
        headers: 'yes',
      },
    });
    expect(container.destroyedRequests).toHaveLength(1);
    expect(events.some((event) => event.startsWith('context:'))).toBeTrue();
    expect(
      events.some((event) => event.startsWith('debug:GET /api/items 200')),
    ).toBeTrue();
  });

  it('uses ALL routes as a fallback for unmatched methods', async () => {
    class ExampleController {
      all(): Response {
        return Response.json({ ok: true });
      }
    }
    const { router } = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(ExampleController, [
            {
              propKind: 'method',
              propKey: 'all',
              value: {
                kind: 'route',
                options: {
                  path: '/items',
                  method: 'ALL',
                },
              },
            },
          ]),
        ],
      },
      [[ExampleController, new ExampleController()]],
    );

    const response = await router.processRequest(
      new Request('http://localhost/api/items', {
        method: 'PATCH',
      }),
      createContext('/api/items', 'PATCH'),
    );

    expect(await read(response)).toEqual({
      status: 200,
      body: {
        ok: true,
      },
    });
  });

  it('runs middleware before controllers and serializes response data', async () => {
    class ExampleMiddleware implements Middleware<{ marker: string }> {
      beforeRequest(context: MiddlewareContext<{ marker: string }>): void {
        context.body = {
          marker: context.marker,
        };
      }

      serializeResponseData(responseData: unknown): Response {
        return Response.json({
          data: responseData,
        });
      }
    }
    class ExampleController {
      get(body: Body): unknown {
        return body;
      }
    }
    const middleware = new ExampleMiddleware();
    const { router } = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(ExampleController, [
            {
              propKind: 'class',
              value: {
                kind: 'middleware',
                middleware: ExampleMiddleware,
                options: {
                  marker: 'ok',
                },
              },
            },
            {
              propKind: 'method',
              propKey: 'get',
              value: {
                kind: 'route',
                options: {
                  path: '/items',
                  method: 'GET',
                  injects: [Body()],
                },
              },
            },
          ]),
        ],
      },
      [[ExampleController, new ExampleController()]],
      [middleware],
    );

    const response = await router.processRequest(
      new Request('http://localhost/api/items'),
      createContext('/api/items'),
    );

    expect(await read(response)).toEqual({
      status: 200,
      body: {
        data: {
          marker: 'ok',
        },
      },
    });
  });

  it('uses middleware responses and serialized exceptions', async () => {
    class ResponseMiddleware implements Middleware {
      beforeRequest(): Response {
        return Response.json({ from: 'middleware' });
      }
    }
    class ExceptionMiddleware implements Middleware {
      serializeException(): Response {
        return Response.json({ handled: true }, { status: 418 });
      }
    }
    class ExampleController {
      get(): Response {
        return Response.json({ unreachable: true });
      }
    }
    class ThrowingController {
      get(): Response {
        throw new BadRequestException('Nope');
      }
    }
    const responseMiddleware = new ResponseMiddleware();
    const exceptionMiddleware = new ExceptionMiddleware();
    const responseComponents = {
      moduleId: Id.for('root'),
      components: [
        createComponent(ThrowingController, [
          {
            propKind: 'class',
            value: {
              kind: 'middleware',
              middleware: ResponseMiddleware,
              options: {},
            },
          },
          {
            propKind: 'class',
            value: {
              kind: 'middleware',
              middleware: ExceptionMiddleware,
              options: {},
            },
          },
          {
            propKind: 'method',
            propKey: 'get',
            value: {
              kind: 'route',
              options: {
                path: '/items',
                method: 'GET',
              },
            },
          },
        ]),
      ],
    } satisfies HTTPMatchedComponents;
    const exceptionComponents = {
      moduleId: Id.for('root'),
      components: [
        createComponent(ExampleController, [
          {
            propKind: 'class',
            value: {
              kind: 'middleware',
              middleware: ExceptionMiddleware,
              options: {},
            },
          },
          {
            propKind: 'method',
            propKey: 'get',
            value: {
              kind: 'route',
              options: {
                path: '/items',
                method: 'GET',
              },
            },
          },
        ]),
      ],
    } satisfies HTTPMatchedComponents;
    const responseRouter = createRouter(
      responseComponents,
      [[ExampleController, new ExampleController()]],
      [responseMiddleware, exceptionMiddleware],
    ).router;
    const exceptionRouter = createRouter(
      exceptionComponents,
      [[ThrowingController, new ThrowingController()]],
      [exceptionMiddleware],
    ).router;

    const middlewareResponse = await responseRouter.processRequest(
      new Request('http://localhost/api/items'),
      createContext('/api/items'),
    );
    const exceptionResponse = await exceptionRouter.processRequest(
      new Request('http://localhost/api/items'),
      createContext('/api/items'),
    );

    expect(await read(middlewareResponse)).toEqual({
      status: 200,
      body: {
        from: 'middleware',
      },
    });
    expect(await read(exceptionResponse)).toEqual({
      status: 418,
      body: {
        handled: true,
      },
    });
  });

  it('converts validation and unexpected errors to HTTP error responses', async () => {
    class ValidationController {
      get(_params: Params): Response {
        return Response.json({ ok: true });
      }
    }
    class ThrowingController {
      get(): Response {
        throw new Error('Boom');
      }
    }
    const validationRouter = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(ValidationController, [
            {
              propKind: 'method',
              propKey: 'get',
              value: {
                kind: 'route',
                options: {
                  path: '/items',
                  method: 'GET',
                  injects: [
                    Params(
                      z.object({
                        id: z.string().uuid(),
                      }),
                    ),
                  ],
                },
              },
            },
          ]),
        ],
      },
      [[ValidationController, new ValidationController()]],
    ).router;
    const throwingRouter = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(ThrowingController, [
            {
              propKind: 'method',
              propKey: 'get',
              value: {
                kind: 'route',
                options: {
                  path: '/items',
                  method: 'GET',
                },
              },
            },
          ]),
        ],
      },
      [[ThrowingController, new ThrowingController()]],
    ).router;

    const validationResponse = await validationRouter.processRequest(
      new Request('http://localhost/api/items'),
      createContext('/api/items'),
    );
    const errorResponse = await throwingRouter.processRequest(
      new Request('http://localhost/api/items'),
      createContext('/api/items'),
    );

    expect(validationResponse?.status).toBe(400);
    expect(await validationResponse?.json()).toEqual({
      errors: expect.any(Array),
    });
    expect(await read(errorResponse)).toEqual({
      status: 500,
      body: {
        error: 'Internal Server Error',
      },
    });
  });

  it('rejects invalid middleware and invalid controller declarations', () => {
    class InvalidMiddleware {}
    class EmptyController {}
    class DuplicateController {
      first(): void {
        //
      }
      second(): void {
        //
      }
    }

    expect(() => createRouter(undefined, [], [new InvalidMiddleware() as never])).toThrow(
      'is not a valid Middleware',
    );
    expect(() =>
      createRouter(
        {
          moduleId: Id.for('root'),
          components: [
            createComponent(EmptyController, [], '/api'),
            createComponent(DuplicateController, [
              {
                propKind: 'method',
                propKey: 'first',
                value: {
                  kind: 'route',
                  options: {
                    path: '/items',
                    method: 'GET',
                  },
                },
              },
              {
                propKind: 'method',
                propKey: 'second',
                value: {
                  kind: 'route',
                  options: {
                    path: '/items',
                    method: 'GET',
                  },
                },
              },
            ]),
          ],
        },
        [[EmptyController, new EmptyController()]],
      ),
    ).toThrow(HTTPRouterException);
  });

  it('rejects missing class-level middleware and invalid controller metadata', () => {
    class MissingMiddleware {}
    class ExampleController {
      get(): void {
        //
      }
    }

    expect(() =>
      createRouter(
        {
          moduleId: Id.for('root'),
          components: [
            {
              useClass: class RootComponent {},
              options: {
                props: [
                  {
                    propKind: 'class',
                    value: {
                      kind: 'middleware',
                      middleware: MissingMiddleware,
                      options: {},
                    },
                  },
                ],
              },
            },
          ],
        },
        [],
      ),
    ).toThrow('Middleware MissingMiddleware is not available in the container');

    expect(() =>
      createRouter(
        {
          moduleId: Id.for('root'),
          components: [
            {
              useProvider: Id.for(ExampleController),
              options: {
                props: [
                  {
                    propKind: 'method',
                    propKey: 'get',
                    value: {
                      kind: 'route',
                      options: {
                        path: '/items',
                        method: 'GET',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
        [[ExampleController, new ExampleController()]],
      ),
    ).toThrow('is not a valid Controller');
  });

  it('inherits parent module middleware when building child module routes', async () => {
    class ParentMiddleware implements Middleware {
      beforeRequest(context: MiddlewareContext): void {
        context.body = {
          inherited: true,
        };
      }
      serializeResponseData(responseData: unknown): Response {
        return Response.json(responseData);
      }
    }
    class ChildController {
      get(body: Body): unknown {
        return body;
      }
    }
    const router = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          {
            useClass: class ParentComponent {},
            options: {
              props: [
                {
                  propKind: 'class',
                  value: {
                    kind: 'middleware',
                    middleware: ParentMiddleware,
                    options: {},
                  },
                },
              ],
            },
          },
        ],
        children: [
          {
            moduleId: Id.for('child'),
            components: [
              createComponent(ChildController, [
                {
                  propKind: 'method',
                  propKey: 'get',
                  value: {
                    kind: 'route',
                    options: {
                      path: '/items',
                      method: 'GET',
                      injects: [Body()],
                    },
                  },
                },
              ]),
            ],
          },
        ],
      },
      [[ChildController, new ChildController()]],
      [new ParentMiddleware()],
    ).router;

    const response = await router.processRequest(
      new Request('http://localhost/api/items'),
      createContext('/api/items'),
    );

    expect(await response?.json()).toEqual({
      inherited: true,
    });
  });

  it('serializes falsy controller response data through middleware', async () => {
    class JSONMiddleware implements Middleware {
      serializeResponseData(responseData: unknown): Response {
        return Response.json({
          data: responseData,
        });
      }
    }
    class CountController {
      get(): number {
        return 0;
      }
    }
    const router = createRouter(
      {
        moduleId: Id.for('root'),
        components: [
          createComponent(CountController, [
            {
              propKind: 'class',
              value: {
                kind: 'middleware',
                middleware: JSONMiddleware,
                options: {},
              },
            },
            {
              propKind: 'method',
              propKey: 'get',
              value: {
                kind: 'route',
                options: {
                  path: '/count',
                  method: 'GET',
                },
              },
            },
          ]),
        ],
      },
      [[CountController, new CountController()]],
      [new JSONMiddleware()],
    ).router;

    const response = await router.processRequest(
      new Request('http://localhost/api/count'),
      createContext('/api/count'),
    );

    expect(await response?.json()).toEqual({
      data: 0,
    });
  });
});
