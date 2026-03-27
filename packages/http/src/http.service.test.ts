import { afterEach, describe, expect, it } from 'bun:test';
import type { ControllerNode, ModuleId } from '@bunito/core';
import { Id } from '@bunito/core';
import { z } from 'zod';
import { Get, Post, Route } from './decorators';
import { HttpException } from './http.exception';
import { HttpService } from './http.service';

type FakeLogger = {
  contexts: Array<unknown>;
  debugCalls: Array<unknown>;
  traceCalls: Array<unknown>;
  setContext: (context: unknown) => void;
  debug: (...args: Array<unknown>) => void;
  trace: (...args: Array<unknown>) => void;
};

type FakeContainer = {
  controllers: Array<ControllerNode>;
  resolveProvider: (
    token: unknown,
    options: { moduleId: ModuleId; requestId?: unknown },
  ) => Promise<unknown>;
};

function createLogger(): FakeLogger {
  return {
    contexts: [],
    debugCalls: [],
    traceCalls: [],
    setContext(context) {
      this.contexts.push(context);
    },
    debug(...args) {
      this.debugCalls.push(args);
    },
    trace(...args) {
      this.traceCalls.push(args);
    },
  };
}

const originalServe = Bun.serve;

afterEach(() => {
  Bun.serve = originalServe;
});

@Route('/api')
class ApiModule {}

function createUsersFixture() {
  @Route('/users')
  class UsersController {
    @Get('/')
    list() {
      return {
        ok: true,
      };
    }

    @Post({
      path: '/validate',
      schema: {
        body: z.object({
          name: z.string(),
        }),
      },
    })
    create(context: { body: { name: string } }) {
      return {
        name: context.body.name,
      };
    }

    @Get('/response')
    customResponse() {
      return new Response('custom', {
        status: 201,
      });
    }

    @Get('/failure')
    fail() {
      throw new Error('boom');
    }
  }

  return {
    UsersController,
    controller: new UsersController(),
  };
}

describe('HttpService', () => {
  it('should resolve handlers using accumulated route metadata and inspect routes', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');
    const { UsersController } = createUsersFixture();
    const container: FakeContainer = {
      controllers: [
        {
          moduleId,
          classStack: [ApiModule, UsersController],
        },
      ],
      resolveProvider: async () => new UsersController(),
    };

    const service = new HttpService({ port: 3000 }, container as never, logger as never);

    await service.resolveHandlers();

    expect(logger.contexts).toEqual([HttpService]);
    expect(logger.debugCalls).toEqual([['Found 4 routes']]);
    expect(service.inspectRoutes()).toEqual([
      'GET /api/users (1)',
      'POST /api/users/validate (1)',
      'GET /api/users/response (1)',
      'GET /api/users/failure (1)',
    ]);
  });

  it('should start and stop Bun server with resolved routes', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');
    const { UsersController } = createUsersFixture();
    const stopCalls: Array<string> = [];
    let serveConfig: Record<string, unknown> | undefined;

    Bun.serve = ((config: Record<string, unknown>) => {
      serveConfig = config;

      return {
        stop: async () => {
          stopCalls.push('stop');
        },
      };
    }) as unknown as typeof Bun.serve;

    const service = new HttpService(
      { port: 4000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [ApiModule, UsersController],
          },
        ],
        resolveProvider: async () => new UsersController(),
      } as never,
      logger as never,
    );

    await service.resolveHandlers();
    service.startServer();
    await service.stop();

    const routes = serveConfig?.routes as Record<
      string,
      Record<string, (request: Request) => Promise<Response>>
    >;
    const fetchHandler = serveConfig?.fetch as (request: Request) => Promise<Response>;
    const getUsersRoute = routes['/api/users']?.GET;

    expect(serveConfig?.port).toBe(4000);
    expect(serveConfig?.routes).toBeDefined();
    expect(getUsersRoute).toBeDefined();

    if (!getUsersRoute) {
      throw new Error('Expected GET /api/users route to be registered');
    }

    expect(
      await getUsersRoute(new Request('http://localhost/api/users') as never).then(
        (response) => response.json(),
      ),
    ).toEqual({ ok: true });
    expect(
      await fetchHandler(new Request('http://localhost/unknown')).then((response) =>
        response.json(),
      ),
    ).toEqual({ error: 'Not Found' });
    expect(logger.traceCalls).toEqual([['Listening on 4000']]);
    expect(stopCalls).toEqual(['stop']);
  });

  it('should process successful object and Response results', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');
    const { UsersController, controller } = createUsersFixture();
    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [ApiModule, UsersController],
          },
        ],
        resolveProvider: async () => controller,
      } as never,
      logger as never,
    );

    await service.resolveHandlers();

    const jsonResponse = await service.processRequest(
      new Request('http://localhost/api/users/', {
        method: 'GET',
      }) as never,
      '/api/users',
    );
    const customResponse = await service.processRequest(
      new Request('http://localhost/api/users/response', {
        method: 'GET',
      }) as never,
      '/api/users/response',
    );

    expect(await jsonResponse.json()).toEqual({ ok: true });
    expect(customResponse.status).toBe(201);
    expect(await customResponse.text()).toBe('custom');
  });

  it('should validate request body and return 400 on invalid payload', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');
    const { UsersController } = createUsersFixture();
    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [ApiModule, UsersController],
          },
        ],
        resolveProvider: async () => new UsersController(),
      } as never,
      logger as never,
    );

    await service.resolveHandlers();

    const response = await service.processRequest(
      new Request('http://localhost/api/users/validate', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
        },
      }) as never,
      '/api/users/validate',
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      body: {
        name: {
          errors: ['Invalid input: expected string, received undefined'],
        },
      },
    });
  });

  it('should ignore invalid json body and continue with undefined body', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');

    @Route('/api')
    class InvalidJsonModule {}

    class InvalidJsonController {
      @Post({
        path: '/broken',
        schema: {
          body: z.object({
            name: z.string(),
          }),
        },
      })
      create() {
        return {
          ok: true,
        };
      }
    }

    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [InvalidJsonModule, InvalidJsonController],
          },
        ],
        resolveProvider: async () => new InvalidJsonController(),
      } as never,
      logger as never,
    );

    await service.resolveHandlers();

    const request = new Request('http://localhost/api/broken', {
      method: 'POST',
      body: 'not-json',
      headers: {
        'content-type': 'application/json',
      },
    }) as never;

    const response = await service.processRequest(request, '/api/broken');

    expect(response.status).toBe(400);
  });

  it('should capture thrown errors and handle missing routes and methods', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');
    const { UsersController } = createUsersFixture();
    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [ApiModule, UsersController],
          },
        ],
        resolveProvider: async () => new UsersController(),
      } as never,
      logger as never,
    );

    await service.resolveHandlers();

    const failure = await service.processRequest(
      new Request('http://localhost/api/users/failure', {
        method: 'GET',
      }) as never,
      '/api/users/failure',
    );
    const notFound = await service.processRequest(
      new Request('http://localhost/missing', {
        method: 'GET',
      }) as never,
    );
    const methodNotAllowed = await service.processRequest(
      new Request('http://localhost/api/users/', {
        method: 'DELETE',
      }) as never,
      '/api/users',
    );

    expect(failure.status).toBe(500);
    expect(await failure.json()).toEqual({
      error: 'Internal Server Error',
    });
    expect(notFound.status).toBe(404);
    expect(await notFound.json()).toEqual({
      error: 'Not Found',
    });
    expect(methodNotAllowed.status).toBe(405);
    expect(await methodNotAllowed.json()).toEqual({
      error: 'Method Not Allowed',
    });
  });

  it('should preserve HttpException status when controller throws one', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');

    @Route('/api')
    class ThrowingModule {}

    class ThrowingController {
      @Get('/problem')
      handler() {
        throw new HttpException(401);
      }
    }

    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [ThrowingModule, ThrowingController],
          },
        ],
        resolveProvider: async () => new ThrowingController(),
      } as never,
      logger as never,
    );

    await service.resolveHandlers();

    const response = await service.processRequest(
      new Request('http://localhost/api/problem', {
        method: 'GET',
      }) as never,
      '/api/problem',
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: 'Unauthorized',
    });
  });

  it('should not mutate route metadata when resolveHandlers is called multiple times', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');
    const { UsersController } = createUsersFixture();
    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [ApiModule, UsersController],
          },
        ],
        resolveProvider: async () => new UsersController(),
      } as never,
      logger as never,
    );

    await service.resolveHandlers();
    const firstRoutes = service.inspectRoutes();

    await service.resolveHandlers();
    const secondRoutes = service.inspectRoutes();

    expect(secondRoutes).toEqual(firstRoutes);
  });

  it('should register multiple handlers for the same path and method', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');

    @Route('/api')
    class DuplicateModule {}

    class DuplicateA {
      @Get('/same')
      first() {
        return {
          from: 'a',
        };
      }
    }

    class DuplicateB {
      @Get('/same')
      second() {
        return {
          from: 'b',
        };
      }
    }

    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [DuplicateModule, DuplicateA],
          },
          {
            moduleId,
            classStack: [DuplicateModule, DuplicateB],
          },
        ],
        resolveProvider: async (token: unknown) => {
          if (token === DuplicateA) {
            return new DuplicateA();
          }

          return new DuplicateB();
        },
      } as never,
      logger as never,
    );

    await service.resolveHandlers();

    expect(service.inspectRoutes()).toContain('GET /api/same (2)');
  });

  it('should register multiple methods under the same path', async () => {
    const logger = createLogger();
    const moduleId = Id.unique('module');

    @Route('/api')
    class MultiMethodModule {}

    class MultiMethodController {
      @Get('/same')
      get() {
        return {
          method: 'get',
        };
      }

      @Post('/same')
      post() {
        return {
          method: 'post',
        };
      }
    }

    const service = new HttpService(
      { port: 3000 },
      {
        controllers: [
          {
            moduleId,
            classStack: [MultiMethodModule, MultiMethodController],
          },
        ],
        resolveProvider: async () => new MultiMethodController(),
      } as never,
      logger as never,
    );

    await service.resolveHandlers();

    expect(service.inspectRoutes()).toEqual(['GET /api/same (1)', 'POST /api/same (1)']);
  });
});
