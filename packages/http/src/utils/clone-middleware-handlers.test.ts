import { describe, expect, it } from 'bun:test';
import type { MiddlewareHandlers } from '../middleware';
import { cloneMiddlewareHandlers } from './clone-middleware-handlers';

describe('cloneMiddlewareHandlers', () => {
  it('creates empty handlers when no source is provided', () => {
    expect(cloneMiddlewareHandlers(undefined)).toEqual({
      beforeRequest: [],
      beforeResponse: [],
      serializeResponseData: [],
      serializeException: [],
    });
  });

  it('clones handler arrays without reusing their references', () => {
    const source: MiddlewareHandlers = {
      beforeRequest: [{ handler: () => undefined, options: {} }],
      beforeResponse: [{ handler: (response) => response, options: {} }],
      serializeResponseData: [{ handler: () => undefined, options: {} }],
      serializeException: [{ handler: () => undefined, options: {} }],
    };

    const clone = cloneMiddlewareHandlers(source);

    expect(clone).toEqual(source);
    expect(clone.beforeRequest).not.toBe(source.beforeRequest);
    expect(clone.beforeResponse).not.toBe(source.beforeResponse);
    expect(clone.serializeResponseData).not.toBe(source.serializeResponseData);
    expect(clone.serializeException).not.toBe(source.serializeException);
  });
});
