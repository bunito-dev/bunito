import { describe, expect, it } from 'bun:test';
import { ZodError, z } from 'zod';
import { HttpException } from './exceptions';
import { HttpRouter } from './http.router';
import { processTokenizedPath } from './utils';

describe('HttpRouter', () => {
  describe('setupRoutes', () => {
    it.todo('registers request, response and exception handlers from controller metadata', async () => {
      const providerId = Symbol.for('controller');
      const moduleId = Symbol.for('module');
      const schema = z.object({
        params: z.object({
          id: z.string(),
        }),
        query: z.object({
          tag: z.union([z.string(), z.array(z.string())]).optional(),
        }),
        body: z.object({
          ok: z.boolean(),
        }),
      });

      const controller = {
        async show(context: {
          params: Record<string, string>;
          query: Record<string, string | string[]>;
          body: unknown;
        }) {
          return {
            id: context.params.id,
            query: context.query,
            body: context.body,
          };
        },
        async respond(data: unknown) {
          return Response.json(data, { status: 201 });
        },
        async fail() {
          throw new HttpException('BAD_REQUEST', 'broken');
        },
        async validation() {
          throw new ZodError([]);
        },
        async handleException(exception: HttpException) {
          return new Response(exception.message, { status: exception.statusCode });
        },
      };

      const container = {
        getComponents: () => [
          {
            providerId,
            moduleId,
            options: [{ kind: 'path', path: '/api' }],
            methods: [
              {
                propKey: 'show',
                options: {
                  kind: 'onRequest',
                  method: 'POST',
                  path: '/users/:id',
                  schema,
                },
              },
              {
                propKey: 'respond',
                options: {
                  kind: 'onResponse',
                  method: 'POST',
                },
              },
              {
                propKey: 'handleException',
                options: {
                  kind: 'onException',
                  method: 'ALL',
                },
              },
              {
                propKey: 'fail',
                options: {
                  kind: 'onRequest',
                  method: 'GET',
                  path: '/fail',
                  schema: null,
                },
              },
              {
                propKey: 'validation',
                options: {
                  kind: 'onRequest',
                  method: 'GET',
                  path: '/validation',
                  schema: null,
                },
              },
            ],
          },
          {
            providerId: undefined,
            moduleId,
            options: [{ kind: 'path', path: '/ignored' }],
            methods: [],
          },
        ],
        resolveProvider: async () => controller,
      };

      const router = new HttpRouter(
        { defaultContentType: 'application/json' },
        container as never,
      );

      await router.setupRoutes();

      const success = await router.processFetchRequest(
        new Request('http://localhost/api/users/7?tag=a&tag=b', {
          method: 'POST',
          body: JSON.stringify({ ok: true }),
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        {
          requestId: Symbol.for('request') as never,
          url: new URL('http://localhost/api/users/7?tag=a&tag=b'),
          logger: undefined,
          data: {},
          upgrade: () => false,
        },
      );
      const failure = await router.processFetchRequest(
        new Request('http://localhost/api/fail'),
        {
          requestId: Symbol.for('request') as never,
          url: new URL('http://localhost/api/fail'),
          logger: undefined,
          data: {},
          upgrade: () => false,
        },
      );
      const validation = await router.processFetchRequest(
        new Request('http://localhost/api/validation'),
        {
          requestId: Symbol.for('request') as never,
          url: new URL('http://localhost/api/validation'),
          logger: undefined,
          data: {},
          upgrade: () => false,
        },
      );

      expect(success?.status).toBe(201);
      expect(await success?.json()).toEqual({
        id: '7',
        query: { tag: ['a', 'b'] },
        body: { ok: true },
      });
      expect(failure?.status).toBe(400);
      expect(await failure?.text()).toBe('broken');
      expect(validation?.status).toBe(400);
      expect(await validation?.text()).toBe('Validation failed');
    });
  });

  describe('processFetchRequest', () => {
    it('returns text responses, falls back to exception rendering and exposes private helpers', async () => {
      const container = {
        getComponents: () => [],
        resolveProvider: async () => ({
          missing: undefined,
        }),
      };

      const router = new HttpRouter(
        { defaultContentType: 'text/plain' },
        container as never,
      );
      const privateRouter = router as never as {
        readRequestBody: (request: Request) => Promise<unknown>;
        handleResponse: (
          requestId: symbol,
          responseData: unknown,
          routeContext: object,
          routeMatches: unknown[],
        ) => Promise<Response>;
      };

      expect(
        await privateRouter.readRequestBody(
          new Request('http://localhost/text', {
            method: 'POST',
            body: 'hello',
            headers: {
              'Content-Type': 'text/plain',
            },
          }),
        ),
      ).toBe('hello');

      expect(
        await privateRouter.readRequestBody(new Request('http://localhost/none')),
      ).toBeNull();

      expect(
        await privateRouter.handleResponse(
          Symbol.for('request'),
          'hello',
          {
            request: new Request('http://localhost'),
            url: new URL('http://localhost'),
            path: '/',
            method: 'GET',
            logger: undefined,
            data: {},
            query: {},
            params: {},
          },
          [],
        ),
      ).toBeInstanceOf(Response);

      await expect(
        privateRouter.handleResponse(
          Symbol.for('request'),
          { nope: true },
          {
            request: new Request('http://localhost'),
            url: new URL('http://localhost'),
            path: '/',
            method: 'GET',
            logger: undefined,
            data: {},
            query: {},
            params: {},
          },
          [],
        ),
      ).rejects.toMatchObject({
        message: 'Not Implemented',
        cause: 'Trying to return non-string value as text/plain response',
      });

      const unsupportedRouter = new HttpRouter(
        { defaultContentType: 'application/xml' as never },
        container as never,
      ) as never as typeof privateRouter;

      await expect(
        unsupportedRouter.handleResponse(
          Symbol.for('request'),
          'hello',
          {
            request: new Request('http://localhost'),
            url: new URL('http://localhost'),
            path: '/',
            method: 'GET',
            logger: undefined,
            data: {},
            query: {},
            params: {},
          },
          [],
        ),
      ).rejects.toMatchObject({
        message: 'Not Implemented',
        cause: 'Cannot return response data as default content type',
      });

      const loggerCalls: string[] = [];
      const jsonRouter = new HttpRouter(
        { defaultContentType: 'application/json' },
        container as never,
      );
      const privateJsonRouter = jsonRouter as never as {
        handleException: (
          requestId: symbol,
          exception: HttpException,
          routeContext: object,
          routeMatches: Array<{
            handler: () => Promise<unknown>;
            options: { method: string };
          }>,
        ) => Promise<Response>;
        createRouteHandler: (
          providerId: symbol,
          moduleId: symbol,
          propKey: string,
        ) => (requestId: symbol) => Promise<unknown>;
        touchNode: (segments: ReturnType<typeof processTokenizedPath>) => unknown;
      };

      const response = await privateJsonRouter.handleException(
        Symbol.for('request'),
        new HttpException('INTERNAL_SERVER_ERROR', undefined, 'warn-me'),
        {
          request: new Request('http://localhost'),
          url: new URL('http://localhost'),
          path: '/',
          method: 'GET',
          logger: {
            warn: (message: string) => {
              loggerCalls.push(`warn:${message}`);
            },
            fatal: (message: string) => {
              loggerCalls.push(`fatal:${message}`);
            },
          },
          data: {},
          query: {},
          params: {},
        },
        [
          {
            handler: async () => {
              throw new Error('broken-handler');
            },
            options: {
              method: 'ALL',
            },
          },
        ],
      );

      expect(response.status).toBe(500);
      expect(loggerCalls).toContain('fatal:Unhandled exception');

      const providerId = Symbol.for('controller');
      expect(
        await privateJsonRouter.createRouteHandler(
          providerId,
          Symbol.for('module'),
          'missing',
        )(Symbol.for('request')),
      ).toBeUndefined();

      expect(
        privateJsonRouter.touchNode(processTokenizedPath('files', ':name', '*', '**')),
      ).toBeDefined();
    });
  });
});
