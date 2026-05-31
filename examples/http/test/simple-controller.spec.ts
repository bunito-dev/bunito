import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { AppModule } from '@apps/simple-controller';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

describe('simple-controller', () => {
  let app: App | undefined;

  beforeAll(async () => {
    const { BunServerModule, LoggerModule } = Test;

    app = await App.create({
      imports: [BunServerModule, LoggerModule, HTTPModule, AppModule],
    });

    await app.start();
  });

  afterAll(async () => {
    await app?.shutdown();
  });

  test('OPTIONS /foo', async () => {
    const { status, headers } = await Test.bunServer
      .buildRequest('/foo')
      .withMethod('OPTIONS')
      .send();

    expect(status).toBe(204);
    expect(headers?.get('Accept')).toBe('GET');
  });

  test('GET /foo', async () => {
    const res = await Test.bunServer.buildRequest('/foo').withMethod('GET').send();

    expect(res.status).toBe(200);
    expect(await res?.json?.()).toEqual({
      foo: 'bar',
    });
  });

  test('GET /foo/bar/:a/:b', async () => {
    const res = await Test.bunServer
      .buildRequest('/foo/bar/a/b?bar=hello&baz=world')
      .withMethod('GET')
      .send();

    expect(res.status).toBe(200);
    expect(await res?.json?.()).toEqual({
      foo: 'bar',
      query: {
        bar: 'hello',
        baz: 'world',
      },
      params: {
        a: 'a',
        b: 'b',
      },
    });
  });

  test('GET /foo/bar/:a/:b/:c', async () => {
    const res = await Test.bunServer
      .buildRequest('/foo/bar/a/b/c')
      .withMethod('GET')
      .send();

    expect(res.status).toBe(200);
    expect(await res?.json?.()).toEqual({
      foo: 'bar',
      query: {
        bar: 'bar',
        baz: 'baz',
      },
      params: {
        a: 'a',
        b: 'b',
        c: 'C',
      },
    });
  });

  test('GET /foo/bar/:a/:b/:c validation failure', async () => {
    const { status } = await Test.bunServer
      .buildRequest('/foo/bar/long/b/c')
      .withMethod('GET')
      .send();

    expect(status).toBe(400);
  });

  test('POST /foo/bar', async () => {
    const res = await Test.bunServer.buildRequest('/foo/bar').withMethod('POST').send();

    expect(res.status).toBe(200);
    expect(await res?.json?.()).toEqual({
      foo: 'bar',
    });
  });
});
