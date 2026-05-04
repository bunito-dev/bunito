import { describe, expect, it } from 'bun:test';
import { BadRequestException } from '../../exceptions';
import { JSONMiddleware } from './json-middleware';

describe('JSONMiddleware', () => {
  it('parses JSON request bodies when enabled', async () => {
    const middleware = new JSONMiddleware();
    const context = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ ok: true }),
      }),
      body: null,
    } as Parameters<JSONMiddleware['beforeRequest']>[0];

    await middleware.beforeRequest(context);

    expect(context.body).toEqual({
      ok: true,
    });
  });

  it('skips body parsing when disabled or when a body already exists', async () => {
    const middleware = new JSONMiddleware();
    const disabled = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ ok: true }),
      }),
      body: null,
      disableBodyParser: true,
    } as Parameters<JSONMiddleware['beforeRequest']>[0];
    const existing = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ ok: true }),
      }),
      body: { existing: true },
    } as Parameters<JSONMiddleware['beforeRequest']>[0];

    await middleware.beforeRequest(disabled);
    await middleware.beforeRequest(existing);

    expect(disabled.body).toBeNull();
    expect(existing.body).toEqual({
      existing: true,
    });
  });

  it('replaces existing bodies when requested', async () => {
    const middleware = new JSONMiddleware();
    const context = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ next: true }),
      }),
      body: { previous: true },
      replaceBody: true,
    } as Parameters<JSONMiddleware['beforeRequest']>[0];

    await middleware.beforeRequest(context);

    expect(context.body).toEqual({
      next: true,
    });
  });

  it('throws bad request exceptions for invalid JSON bodies', async () => {
    const middleware = new JSONMiddleware();
    const context = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: '{',
      }),
      body: null,
    } as Parameters<JSONMiddleware['beforeRequest']>[0];

    let error: unknown;
    try {
      await middleware.beforeRequest(context);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as Error).message).toBe('Invalid JSON body');
  });

  it('serializes response data and exceptions as JSON responses', async () => {
    const middleware = new JSONMiddleware();
    const response = middleware.serializeResponseData({ ok: true });
    const exception = middleware.serializeException(new BadRequestException());

    expect(await response.json()).toEqual({
      ok: true,
    });
    expect(exception.status).toBe(400);
    expect(await exception.json()).toEqual({
      error: 'Bad Request',
    });
  });
});
