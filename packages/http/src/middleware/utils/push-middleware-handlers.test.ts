import { describe, expect, it } from 'bun:test';
import type { Middleware } from '../middleware';
import type { MiddlewareHandlers } from '../types';
import { cloneMiddlewareHandlers } from './clone-middleware-handlers';
import { pushMiddlewareHandlers } from './push-middleware-handlers';

describe('pushMiddlewareHandlers', () => {
  it('pushes implemented middleware handlers with options', () => {
    const handlers = cloneMiddlewareHandlers(undefined);
    const middleware: Middleware = {
      beforeRequest: () => undefined,
      serializeResponseData: () => undefined,
      serializeException: () => undefined,
    };

    pushMiddlewareHandlers(handlers, middleware, { enabled: true });

    expect(handlers.beforeRequest).toHaveLength(1);
    expect(handlers.serializeResponseData).toHaveLength(1);
    expect(handlers.serializeException).toHaveLength(1);
    expect(handlers.beforeRequest.at(0)?.options).toEqual({
      enabled: true,
    });
  });

  it('ignores middleware methods that are not implemented', () => {
    const handlers: MiddlewareHandlers = {
      beforeRequest: [],
      serializeResponseData: [],
      serializeException: [],
    };

    pushMiddlewareHandlers(handlers, {}, {});

    expect(handlers).toEqual({
      beforeRequest: [],
      serializeResponseData: [],
      serializeException: [],
    });
  });
});
