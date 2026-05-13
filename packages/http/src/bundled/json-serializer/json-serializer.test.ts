import { describe, expect, it } from 'bun:test';
import { getClassMetadata } from '@bunito/container/internals';
import { NotFoundException } from '../../exceptions';
import { Middleware } from '../../middleware';
import { JSONSerializer } from './json-serializer';

describe('JSONSerializer', () => {
  it('registers as middleware', () => {
    expect(getClassMetadata(JSONSerializer, 'provider')).toEqual({
      decorator: Middleware,
      options: {},
    });
  });

  it('serializes response data as JSON responses', async () => {
    const serializer = new JSONSerializer();
    const response = serializer.serializeResponseData({ ok: true });

    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ ok: true });
  });

  it('serializes HTTP exceptions as JSON responses', async () => {
    const serializer = new JSONSerializer();
    const response = serializer.serializeException(new NotFoundException());

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({
      error: 'Not Found',
    });
  });
});
