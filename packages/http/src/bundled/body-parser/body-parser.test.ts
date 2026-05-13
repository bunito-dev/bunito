import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container/internals';
import { BadRequestException } from '../../exceptions';
import { Middleware } from '../../middleware';
import { BodyParser } from './body-parser';

describe('BodyParser', () => {
  it('registers as middleware', () => {
    expect(getClassMetadata(BodyParser, 'provider')).toEqual({
      decorator: Middleware,
      options: {},
    });
  });

  it('parses JSON request bodies by default', async () => {
    const parser = new BodyParser();
    const context: {
      body?: unknown;
      request: Request;
    } = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ ok: true }),
      }),
    };

    await parser.beforeRequest(context as never);

    expect(context).toEqual({
      request: expect.any(Request),
      body: {
        ok: true,
      },
    });
  });

  it('parses text request bodies when configured', async () => {
    const parser = new BodyParser();
    const context: {
      body?: unknown;
      parser: 'text';
      request: Request;
    } = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: 'hello',
      }),
      parser: 'text',
    };

    await parser.beforeRequest(context as never);

    expect(context.body).toBe('hello');
  });

  it('parses binary, blob, and form data request bodies when configured', async () => {
    const parser = new BodyParser();
    const binaryContext: {
      body?: unknown;
      parser: 'bytes';
      request: Request;
    } = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: 'hello',
      }),
      parser: 'bytes',
    };
    const blobContext: {
      body?: unknown;
      parser: 'blob';
      request: Request;
    } = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: 'hello',
      }),
      parser: 'blob',
    };
    const arrayBufferContext: {
      body?: unknown;
      parser: 'arrayBuffer';
      request: Request;
    } = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: 'hello',
      }),
      parser: 'arrayBuffer',
    };
    const formData = new FormData();
    formData.set('name', 'bunito');
    const formContext: {
      body?: unknown;
      parser: 'formData';
      request: Request;
    } = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: formData,
      }),
      parser: 'formData',
    };

    await parser.beforeRequest(binaryContext as never);
    await parser.beforeRequest(blobContext as never);
    await parser.beforeRequest(arrayBufferContext as never);
    await parser.beforeRequest(formContext as never);

    expect(binaryContext.body).toBeInstanceOf(Uint8Array);
    expect(blobContext.body).toBeInstanceOf(Blob);
    expect(arrayBufferContext.body).toBeInstanceOf(ArrayBuffer);
    expect(formContext.body).toBeInstanceOf(FormData);
  });

  it('ignores requests without a readable body', async () => {
    const parser = new BodyParser();
    const context = {
      request: new Request('http://localhost'),
    };

    await parser.beforeRequest(context as never);

    expect('body' in context).toBeFalse();
  });

  it('throws BadRequestException for invalid JSON bodies', async () => {
    const parser = new BodyParser();
    const context = {
      request: new Request('http://localhost', {
        method: 'POST',
        body: '{',
      }),
    };

    let error: unknown;
    try {
      await parser.beforeRequest(context as never);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as Error).message).toBe('Invalid Body');
  });
});
