import { describe, expect, it } from 'bun:test';
import { Id } from '@bunito/container';
import { HttpException, RequestContext } from '@bunito/server';
import { BadRequestException, NotImplementedException } from '../exceptions';
import { JSON_CONTENT_TYPE } from './constants';
import { JSONMiddleware } from './json.middleware';

describe('JSONMiddleware', () => {
  const createContext = (request: Request) =>
    new RequestContext(
      Id.unique('Request'),
      request,
      undefined,
      {} as never,
      {
        warn: () => {
          //
        },
      } as never,
    );

  it('parses JSON request bodies by default', async () => {
    const context = createContext(
      new Request('https://example.test', {
        method: 'POST',
        headers: {
          'Content-Type': JSON_CONTENT_TYPE,
        },
        body: JSON.stringify({
          name: 'Ada',
        }),
      }),
    );

    await new JSONMiddleware().beforeRequest(context);

    expect(context.body).toEqual({
      name: 'Ada',
    });
  });

  it('skips body parsing when disabled or content type is not JSON', async () => {
    const middleware = new JSONMiddleware();
    const disabled = createContext(
      new Request('https://example.test', {
        method: 'POST',
        body: JSON.stringify({ skipped: true }),
      }),
    );
    const otherContentType = createContext(
      new Request('https://example.test', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'hello',
      }),
    );

    await middleware.beforeRequest(disabled, { disableBodyParser: true });
    await middleware.beforeRequest(otherContentType);

    expect(disabled.body).toBeUndefined();
    expect(otherContentType.body).toBeUndefined();
  });

  it('throws BadRequestException for invalid JSON', async () => {
    const context = createContext(
      new Request('https://example.test', {
        method: 'POST',
        body: '{',
      }),
    );

    await expect(new JSONMiddleware().beforeRequest(context)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('serializes response data and HTTP exceptions as JSON', async () => {
    const middleware = new JSONMiddleware();
    const response = middleware.serializeResponseData(
      { ok: true },
      createContext(new Request('https://example.test')),
    );
    const exceptionResponse = middleware.serializeException(
      new HttpException('BAD_REQUEST', 'Invalid', { field: 'name' }),
    );
    const errorResponse = middleware.serializeException(
      new HttpException('NOT_FOUND', 'Missing'),
    );

    expect(await response.json()).toEqual({ ok: true });
    expect(await exceptionResponse.json()).toEqual({ field: 'name' });
    expect(await errorResponse.json()).toEqual({ error: 'Missing' });
    expect(exceptionResponse.status).toBe(400);
  });

  it('throws NotImplementedException for unserializable response data', () => {
    const data: Record<string, unknown> = {};
    data.self = data;

    expect(() =>
      new JSONMiddleware().serializeResponseData(
        data,
        createContext(new Request('https://example.test')),
      ),
    ).toThrow(NotImplementedException);
  });
});
