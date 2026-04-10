import { describe, expect, it, test } from 'bun:test';
import { getDecoratorMetadata } from '@bunito/common';
import type { ClassProviderMetadata, LifecycleProps } from '@bunito/core';
import {
  CONTAINER_METADATA_KEYS as CORE_DECORATOR_METADATA_KEYS,
  Container,
  Id,
  Logger,
  MODULE_ID,
} from '@bunito/core';
import { z } from 'zod';
import { HttpException } from '../exceptions';
import { OnException, OnGet, OnPost, OnResponse, UsesPath } from './decorators';
import { RoutingConfig } from './routing.config';
import { RoutingService } from './routing.service';
import type {
  OnExceptionMatch,
  OnRequestEntity,
  OnRequestMatch,
  OnResponseMatch,
  RouteMatches,
  RouteNode,
} from './types';

type FakeLogger = {
  setContextCalls: unknown[][];
  warns: unknown[][];
  fatals: unknown[][];
  debugs: unknown[][];
  traceInfos: unknown[][];
  setContext: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  fatal: (...args: unknown[]) => void;
  trace: () => {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
  };
};

function createLogger(): FakeLogger {
  const result: FakeLogger = {
    setContextCalls: [],
    warns: [],
    fatals: [],
    debugs: [],
    traceInfos: [],
    setContext(...args) {
      this.setContextCalls.push(args);
    },
    warn(...args) {
      this.warns.push(args);
    },
    fatal(...args) {
      this.fatals.push(args);
    },
    trace: () => ({
      debug: (...args) => {
        result.debugs.push(args);
      },
      info: (...args) => {
        result.traceInfos.push(args);
      },
    }),
  };

  return result;
}

const logger = createLogger();

function createService(options?: {
  defaultContentType?: 'application/json' | 'text/plain' | 'application/xml';
  container?: Partial<Container>;
}) {
  const container = {
    controllers: [],
    async resolveProvider() {
      return undefined;
    },
    ...options?.container,
  } as unknown as Container;

  return new RoutingService(
    {
      defaultContentType: options?.defaultContentType ?? 'application/json',
    } as never,
    container,
    new Id('http-module'),
  );
}

describe('RoutingService', () => {
  it('should be registered with config, container and module injections plus init hook', () => {
    expect(
      getDecoratorMetadata<ClassProviderMetadata>(
        RoutingService,
        CORE_DECORATOR_METADATA_KEYS.PROVIDER,
      ),
    ).toEqual({
      injects: [RoutingConfig, Container, MODULE_ID],
    });
    expect(
      getDecoratorMetadata<LifecycleProps>(
        RoutingService,
        CORE_DECORATOR_METADATA_KEYS.ON_LIFECYCLE,
      ),
    ).toEqual(new Map([['onInit', 'setupRoutes']]));
  });

  it('should read request bodies for supported content types', async () => {
    const service = createService() as unknown as {
      readRequestBody: (request: Request) => Promise<unknown>;
    };

    expect(
      await service.readRequestBody(
        new Request('http://localhost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ok: true }),
        }),
      ),
    ).toEqual({
      ok: true,
    });
    expect(
      await service.readRequestBody(
        new Request('http://localhost', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: 'hello',
        }),
      ),
    ).toBe('hello');

    const stream = await service.readRequestBody(
      new Request('http://localhost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: 'raw',
      }),
    );

    expect(stream).toBeInstanceOf(ReadableStream);
    expect(await service.readRequestBody(new Request('http://localhost'))).toBeNull();
  });

  it('should prepare request context and apply schema parsing', async () => {
    const service = createService() as unknown as {
      prepareRequestContext: (
        params: Record<string, string>,
        context: Record<string, unknown>,
        schema: {
          parseAsync: (value: unknown) => Promise<Record<string, unknown>>;
        } | null,
      ) => Promise<Record<string, unknown>>;
    };
    const context = {
      data: {},
      query: {},
      params: {},
      body: 'body',
    };

    expect(await service.prepareRequestContext({ id: '1' }, context, null)).toEqual({
      ...context,
      params: {
        id: '1',
      },
    });
    expect(
      await service.prepareRequestContext({ id: '2' }, context, {
        async parseAsync(value) {
          return {
            ...(value as Record<string, unknown>),
            body: {
              parsed: true,
            },
          };
        },
      }),
    ).toEqual({
      ...context,
      params: {
        id: '2',
      },
      body: {
        parsed: true,
      },
    });
  });

  it('should resolve handlers and skip missing controller methods', async () => {
    class Controller {
      hello(name: string): string {
        return `hello ${name}`;
      }
    }

    const service = createService({
      container: {
        async resolveProvider() {
          return new Controller();
        },
      },
    }) as unknown as {
      createRouteHandler: (
        controllerClass: typeof Controller,
        moduleId: Id,
        propKey: PropertyKey,
      ) => (requestId: Id, ...args: unknown[]) => Promise<unknown>;
    };
    const handler = service.createRouteHandler(Controller, new Id('module'), 'hello');
    const missing = service.createRouteHandler(Controller, new Id('module'), 'missing');

    expect(await handler(new Id('request'), 'bunito')).toBe('hello bunito');
    expect(await missing(new Id('request'))).toBeUndefined();
  });

  it('should handle request and response pipelines', async () => {
    const service = createService() as unknown as {
      handleRequest: (
        requestId: Id,
        routeContext: Record<string, unknown>,
        routeMatches: OnRequestMatch[],
      ) => Promise<unknown>;
      handleResponse: (
        requestId: Id,
        responseData: unknown,
        routeContext: Record<string, unknown>,
        routeMatches: OnResponseMatch[],
      ) => Promise<Response>;
    };
    const requestId = new Id('request');
    const routeContext = {
      logger,
      params: {},
      query: {},
      data: {},
    };

    expect(
      await service.handleRequest(requestId, routeContext, [
        {
          params: {},
          options: {
            path: '/',
            method: 'ALL',
            schema: null,
          },
          controllerName: 'Controller',
          propKey: 'noop',
          async handler() {
            return undefined;
          },
        },
        {
          params: {
            id: '1',
          },
          options: {
            path: '/:id',
            method: 'GET',
            schema: z.object({
              params: z.object({
                id: z.string().transform((value) => `user:${value}`),
              }),
            }),
          },
          controllerName: 'Controller',
          propKey: 'get',
          async handler(_requestId, context) {
            return context;
          },
        },
      ]),
    ).toMatchObject({
      params: {
        id: 'user:1',
      },
    });

    const overridden = await service.handleResponse(
      requestId,
      {
        ok: true,
      },
      routeContext,
      [
        {
          params: {},
          options: {
            method: 'GET',
          },
          controllerName: 'Controller',
          propKey: 'onResponse',
          async handler() {
            return new Response('override', {
              status: 201,
            });
          },
        },
      ],
    );

    expect(overridden.status).toBe(201);
    expect(await overridden.text()).toBe('override');

    const json = await service.handleResponse(requestId, { ok: true }, routeContext, []);

    expect(await json.json()).toEqual({
      ok: true,
    });
    expect(
      service.handleResponse(requestId, undefined, routeContext, []),
    ).rejects.toThrow('Not Found');
  });

  it('should render text responses and reject unsupported response payloads', async () => {
    const service = createService({
      defaultContentType: 'text/plain',
    }) as unknown as {
      handleResponse: (
        requestId: Id,
        responseData: unknown,
        routeContext: Record<string, unknown>,
        routeMatches: OnResponseMatch[],
      ) => Promise<Response>;
    };
    const routeContext = {
      logger,
      params: {},
      query: {},
      data: {},
    };

    expect(
      await (
        await service.handleResponse(new Id('request'), 'plain', routeContext, [])
      ).text(),
    ).toBe('plain');
    expect(
      service.handleResponse(new Id('request'), { bad: true }, routeContext, []),
    ).rejects.toThrow('Not Implemented');
    expect(
      (
        createService({
          defaultContentType: 'application/xml',
        }) as unknown as {
          handleResponse: (
            requestId: Id,
            responseData: unknown,
            routeContext: Record<string, unknown>,
            routeMatches: OnResponseMatch[],
          ) => Promise<Response>;
        }
      ).handleResponse(new Id('request'), 'xml', routeContext, []),
    ).rejects.toThrow('Not Implemented');
  });

  it('should handle exceptions, log causes and support custom handlers', async () => {
    const requestId = new Id('request');
    const routeContext = {
      logger,
      params: {},
      query: {},
      data: {},
    };

    logger.warns.length = 0;
    logger.fatals.length = 0;

    const jsonService = createService() as unknown as {
      handleException: (
        requestId: Id,
        exception: HttpException,
        routeContext: Record<string, unknown>,
        routeMatches: OnExceptionMatch[],
      ) => Promise<Response>;
    };

    const custom = await jsonService.handleException(
      requestId,
      new HttpException('BAD_REQUEST'),
      routeContext,
      [
        {
          options: {
            method: 'ALL',
          },
          controllerName: 'Controller',
          propKey: 'onException',
          async handler() {
            return new Response('custom', {
              status: 418,
            });
          },
        },
      ],
    );

    expect(custom.status).toBe(418);

    const withStringCause = await jsonService.handleException(
      requestId,
      new HttpException('BAD_REQUEST', undefined, 'bad input'),
      routeContext,
      [],
    );

    expect(withStringCause.status).toBe(400);
    expect(await withStringCause.json()).toEqual({
      error: 'Bad Request',
      data: undefined,
    });
    expect(logger.warns).toEqual([['bad input']]);

    const textService = createService({
      defaultContentType: 'text/plain',
    }) as unknown as {
      handleException: (
        requestId: Id,
        exception: HttpException,
        routeContext: Record<string, unknown>,
        routeMatches: OnExceptionMatch[],
      ) => Promise<Response>;
    };
    const withErrorCause = await textService.handleException(
      requestId,
      new HttpException('INTERNAL_SERVER_ERROR', undefined, new Error('boom')),
      routeContext,
      [],
    );

    expect(withErrorCause.status).toBe(500);
    expect(await withErrorCause.text()).toBe('Internal Server Error');
    expect(logger.fatals).toEqual([['Unhandled exception', expect.any(Error)]]);
  });

  test('should return captured exception JSON payloads when an exception handler throws instead of serializing the original exception', async () => {
    const service = createService() as unknown as {
      handleException: (
        requestId: Id,
        exception: HttpException,
        routeContext: Record<string, unknown>,
        routeMatches: OnExceptionMatch[],
      ) => Promise<Response>;
    };
    const response = await service.handleException(
      new Id('request'),
      new HttpException('BAD_REQUEST'),
      {
        logger,
      },
      [
        {
          options: {
            method: 'ALL',
          },
          controllerName: 'Controller',
          propKey: 'onException',
          async handler() {
            throw new Error('broken handler');
          },
        },
      ],
    );

    expect(await response.json()).toEqual({
      error: 'Internal Server Error',
      data: undefined,
    });
  });

  it('should build and inspect routes from controller metadata', async () => {
    @UsesPath('/api')
    class ApiRoot {}

    @UsesPath('/v1')
    class V1Root {}

    const parentClasses = [ApiRoot, V1Root];

    @UsesPath('/users')
    class UsersController {
      @OnGet('/:id')
      get(): unknown {
        return undefined;
      }

      @OnResponse({
        method: 'GET',
      })
      response(): Response {
        return new Response();
      }

      @OnException()
      exception(): Response {
        return new Response();
      }
    }

    @UsesPath('/files')
    class FilesController {
      @OnPost('/**')
      create(): unknown {
        return undefined;
      }
    }

    const container = {
      controllers: [
        {
          parentClasses,
          useClass: UsersController,
          moduleId: new Id('users-module'),
        },
        {
          parentClasses,
          useClass: FilesController,
          moduleId: new Id('files-module'),
        },
      ],
      async resolveProvider() {
        return undefined;
      },
    } as unknown as Container;
    const service = createService({
      container,
    });

    await service.setupRoutes();

    expect(service.inspectRoutes()).toEqual([
      {
        method: 'GET',
        path: '/api/v1/users',
        onResponse: [
          {
            controllerName: 'UsersController',
            propKey: 'response',
          },
        ],
      },
      {
        method: 'ALL',
        path: '/api/v1/users',
        onError: [
          {
            controllerName: 'UsersController',
            propKey: 'exception',
          },
        ],
      },
      {
        method: 'GET',
        path: '/api/v1/users/:id',
        onRequest: [
          {
            controllerName: 'UsersController',
            propKey: 'get',
          },
        ],
      },
      {
        path: '/api/v1/files/**',
        method: 'POST',
        onRequest: [
          {
            controllerName: 'FilesController',
            propKey: 'create',
          },
        ],
      },
    ]);
  });

  it('should match routes for static, param and wildcard segments', () => {
    const service = createService() as unknown as {
      matchRoute: (
        pathTokens: string[],
        method: 'GET' | 'POST',
        matches: RouteMatches,
        depth?: number,
        node?: RouteNode,
      ) => void;
      touchNode: (
        segments: Array<{
          kind: 'static' | 'param' | 'wildcard' | 'any';
          value?: string;
          name?: string;
        }>,
      ) => RouteNode;
    };
    const root = (service as unknown as { rootNode: RouteNode }).rootNode;
    const onRequest: OnRequestEntity = {
      controllerName: 'Controller',
      propKey: 'get',
      options: {
        method: 'GET' as const,
        path: '/' as const,
        schema: null,
      },
      async handler() {
        return undefined;
      },
    };

    service.touchNode([
      { kind: 'static', value: 'users' },
      { kind: 'param', name: 'id' },
    ]).handlers = {
      onRequest: [onRequest],
    };
    service.touchNode([
      { kind: 'static', value: 'files' },
      { kind: 'wildcard' },
    ]).handlers = {
      onRequest: [
        {
          ...onRequest,
          options: {
            ...onRequest.options,
            method: 'POST',
          },
        },
      ],
    };
    service.touchNode([{ kind: 'static', value: 'blob' }, { kind: 'any' }]).handlers = {
      onRequest: [onRequest],
    };

    const matches: RouteMatches = {
      onRequest: [],
      onResponse: [],
      onException: [],
    };

    service.matchRoute(['users', '42'], 'GET', matches, 0, root);
    service.matchRoute(['files', 'a', 'b'], 'POST', matches, 0, root);
    service.matchRoute(['blob', 'raw'], 'GET', matches, 0, root);

    expect(matches.onRequest).toEqual([
      expect.objectContaining({
        params: {
          id: '42',
        },
      }),
      expect.objectContaining({
        params: {},
      }),
      expect.objectContaining({
        params: {},
      }),
    ]);
  });

  it('should detect route entities only when metadata exists', () => {
    @UsesPath('/demo')
    class DemoController {
      @OnGet('/')
      get(): unknown {
        return undefined;
      }

      @OnResponse()
      onResponse(): Response {
        return new Response();
      }

      @OnException()
      onException(): Response {
        return new Response();
      }
    }

    class PlainController {}

    const service = createService() as unknown as {
      detectOnRequestEntities: (
        parentNode: RouteNode,
        controllerClass: typeof DemoController,
        moduleId: Id,
      ) => void;
      detectOnResponseEntities: (
        parentNode: RouteNode,
        controllerClass: typeof DemoController,
        moduleId: Id,
      ) => void;
      detectOnExceptionEntities: (
        parentNode: RouteNode,
        controllerClass: typeof DemoController,
        moduleId: Id,
      ) => void;
      touchNode: (segments: Array<{ kind: 'static'; value: string }>) => RouteNode;
    };
    const node = service.touchNode([{ kind: 'static', value: 'root' }]);

    service.detectOnRequestEntities(node, DemoController, new Id('module'));
    service.detectOnResponseEntities(node, DemoController, new Id('module'));
    service.detectOnExceptionEntities(node, DemoController, new Id('module'));
    service.detectOnRequestEntities(node, PlainController as never, new Id('module'));
    service.detectOnResponseEntities(node, PlainController as never, new Id('module'));
    service.detectOnExceptionEntities(node, PlainController as never, new Id('module'));

    expect(node.handlers).toMatchObject({
      onRequest: [
        {
          controllerName: 'DemoController',
          propKey: 'get',
        },
      ],
      onResponse: [
        {
          controllerName: 'DemoController',
          propKey: 'onResponse',
        },
      ],
      onException: [
        {
          controllerName: 'DemoController',
          propKey: 'onException',
        },
      ],
    });
  });

  it('should process requests end-to-end including validation and exception conversion', async () => {
    const requestLogger = createLogger();
    const routeSchema = z.object({
      params: z.object({
        id: z.string(),
      }),
      query: z.object({
        page: z.string(),
      }),
    });

    @UsesPath('/users')
    class UsersController {
      @OnGet('/:id', routeSchema)
      get(context: { params: { id: string }; query: { page: string } }) {
        return {
          id: context.params.id,
          page: context.query.page,
        };
      }

      @OnPost('/validate', routeSchema)
      validate() {
        return undefined;
      }
    }

    const controllerInstances = new Map<unknown, unknown>([
      [UsersController, new UsersController()] as const,
      [Logger, requestLogger] as const,
    ]);

    @UsesPath('/api')
    class ApiRoot {}

    const parentClasses = [ApiRoot];

    const container = {
      controllers: [
        {
          parentClasses,
          useClass: UsersController,
          moduleId: new Id('module'),
        },
      ],
      async resolveProvider(token: unknown) {
        return controllerInstances.get(token as never);
      },
    } as unknown as Container;
    const service = createService({
      container,
    });

    await service.setupRoutes();

    const okResponse = await service.processRequest(
      new Request('http://localhost/api/users/42?page=1', {
        method: 'GET',
      }),
    );

    expect(await okResponse.json()).toEqual({
      id: '42',
      page: '1',
    });

    const invalidResponse = await service.processRequest(
      new Request('http://localhost/api/users/validate', {
        method: 'POST',
      }),
    );

    expect(invalidResponse.status).toBe(400);
    expect(await invalidResponse.json()).toMatchObject({
      issues: expect.any(Array),
    });
    expect(requestLogger.setContextCalls).toEqual([['HttpRequest'], ['HttpRequest']]);
    expect(requestLogger.debugs).toEqual([
      ['200 GET /api/users/42'],
      ['400 POST /api/users/validate'],
    ]);
  });

  it('should capture thrown non-http exceptions during request handling', async () => {
    const requestLogger = createLogger();

    @UsesPath('/fail')
    class FailController {
      @OnGet('/')
      get() {
        throw new Error('boom');
      }
    }

    const container = {
      controllers: [
        {
          parentClasses: [],
          useClass: FailController,
          moduleId: new Id('module'),
        },
      ],
      async resolveProvider(token: unknown) {
        if (token === Logger) {
          return requestLogger;
        }

        return new FailController();
      },
    } as unknown as Container;
    const service = createService({
      container,
      defaultContentType: 'text/plain',
    });

    await service.setupRoutes();

    const response = await service.processRequest(
      new Request('http://localhost/fail', {
        method: 'GET',
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
    expect(requestLogger.fatals).toEqual([['Unhandled exception', expect.any(Error)]]);
  });
});
