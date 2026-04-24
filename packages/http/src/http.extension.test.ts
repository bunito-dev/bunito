import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from '@bunito/common';
import { Id } from '@bunito/container';
import { RequestContext } from '@bunito/server/internals';
import { z } from 'zod';
import { CONTROLLER_COMPONENT, MIDDLEWARE_EXTENSION } from './constants';
import { BadRequestException, NotFoundException } from './exceptions';
import { HttpExtension } from './http.extension';
import { Body, Params, Query } from './injections';
import type { Middleware } from './middleware';

describe('HttpExtension', () => {
  class TestMiddleware implements Middleware<{ tag: string }> {
    beforeRequest(context: RequestContext, options?: { tag: string }): void {
      context.body = {
        tag: options?.tag,
      };
    }

    serializeResponseData(data: unknown): Response {
      return Response.json(data);
    }

    serializeException(error: { message: string; status: number }): Response {
      return Response.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        },
      );
    }
  }

  class TestController {
    handle(...args: unknown[]): unknown {
      return {
        args,
      };
    }

    missing(): undefined {
      return undefined;
    }

    fail(): never {
      throw new BadRequestException('Nope');
    }
  }

  const moduleId = Id.unique('Module');
  const controllerId = Id.for(TestController);
  const middlewareId = Id.for(TestMiddleware);

  const createContext = (path: `/${string}` = '/api/users/1', method = 'GET') => {
    const request = new Request(`https://example.test${path}?search=bunito`, {
      method,
    }) as Request & { params: Record<string, string> };
    request.params = {
      id: '1',
    };

    return new RequestContext(
      Id.unique('Request'),
      request,
      path,
      {} as never,
      {
        fatal: () => {
          //
        },
      } as never,
    );
  };

  const createContainer = (
    controller = new TestController(),
    middleware = new TestMiddleware(),
  ) => ({
    getExtensions: (key: symbol) =>
      key === MIDDLEWARE_EXTENSION
        ? [
            {
              providerId: middlewareId,
              moduleId,
            },
          ]
        : [],
    resolveProvider: async (providerId: unknown) => {
      if (providerId === middlewareId) {
        return middleware;
      }

      if (providerId === controllerId) {
        return controller;
      }
    },
    tryResolveProvider: async (token: unknown) =>
      token === Symbol.for('token') ? 'resolved' : undefined,
    getComponents: (key: symbol) =>
      key === CONTROLLER_COMPONENT
        ? [
            {
              moduleId,
              useProviderId: controllerId,
              options: [
                {
                  kind: 'prefix',
                  prefix: '/api',
                },
                {
                  kind: 'middleware',
                  middleware: TestMiddleware,
                  options: {
                    tag: 'parent',
                  },
                },
              ],
              props: [
                {
                  kind: 'method',
                  propKey: 'handle',
                  options: {
                    path: '/users/1',
                    method: 'GET',
                    injects: [
                      Request,
                      Headers,
                      URL,
                      Params(
                        z.object({
                          id: z.string(),
                        }),
                      ),
                      Query(
                        z.object({
                          search: z.string(),
                        }),
                      ),
                      Body(
                        z.object({
                          tag: z.string(),
                        }),
                      ),
                      RequestContext,
                      Symbol.for('token'),
                      'value',
                    ],
                  },
                },
                {
                  kind: 'method',
                  propKey: 'fail',
                  options: {
                    path: '/fail',
                    method: 'GET',
                  },
                },
                {
                  kind: 'method',
                  propKey: 'missing',
                  options: {
                    path: '/missing',
                    method: 'GET',
                  },
                },
                {
                  kind: 'field',
                  propKey: 'field',
                  options: {},
                },
              ],
            },
            {
              moduleId,
              useClass: class IgnoredController {},
              options: [],
              props: [],
            },
          ]
        : [],
  });

  it('configures routes and processes matching controller requests', async () => {
    const extension = new HttpExtension(createContainer() as never, new Set([moduleId]));

    await extension.configure();

    expect(extension.getRoutes()).toEqual([
      {
        path: '/api/users/1',
        method: 'GET',
      },
      {
        path: '/api/fail',
        method: 'GET',
      },
      {
        path: '/api/missing',
        method: 'GET',
      },
    ]);

    const response = await extension.processRequest(createContext());
    const body = (await response?.json()) as { args: unknown[] };

    expect(body.args).toHaveLength(9);
    expect(body.args.slice(3)).toEqual([
      { id: '1' },
      { search: 'bunito' },
      { tag: 'parent' },
      expect.objectContaining({
        path: '/api/users/1',
      }),
      'resolved',
      'value',
    ]);
  });

  it('serializes handled HTTP exceptions through middleware', async () => {
    const extension = new HttpExtension(createContainer() as never, new Set([moduleId]));

    await extension.configure();

    const response = await extension.processRequest(createContext('/api/fail'));

    expect(response?.status).toBe(400);
    expect(await response?.json()).toEqual({
      error: 'Nope',
    });
  });

  it('throws NotFoundException when no route returns a response', async () => {
    const extension = new HttpExtension(createContainer() as never, new Set([moduleId]));

    await extension.configure();

    expect(extension.processRequest(createContext('/api/missing'))).rejects.toThrow(
      NotFoundException,
    );
    expect(extension.processRequest(createContext('/api/unknown'))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects invalid and missing middleware configuration', async () => {
    expect(
      new HttpExtension(
        createContainer(undefined, {} as never) as never,
        new Set([moduleId]),
      ).configure(),
    ).rejects.toThrow(ConfigurationException);

    const container = createContainer();
    container.getExtensions = () => [];

    expect(
      new HttpExtension(container as never, new Set([moduleId])).configure(),
    ).rejects.toThrow(ConfigurationException);
  });

  it('validates schema injections and falls back to request body for raw Body()', async () => {
    const extension = new HttpExtension(createContainer() as never, new Set([moduleId]));
    const context = createContext();

    context.body = undefined;

    expect(await extension.resolveInjection(context, moduleId, Body())).toBe(
      context.request.body,
    );

    expect(
      extension.resolveInjection(context, moduleId, Body(z.object({ tag: z.string() }))),
    ).rejects.toThrow('Invalid input');
  });
});
