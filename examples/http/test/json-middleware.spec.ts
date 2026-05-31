import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { AppModule } from '@apps/json-middleware';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

describe('json-middleware', () => {
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

  test('OPTIONS /foo/:bar', async () => {
    const { status, headers } = await Test.bunServer
      .buildRequest('/foo/bar-param')
      .withMethod('OPTIONS')
      .send();

    expect(status).toBe(204);
    expect(headers?.get('Accept')).toBe('GET, POST');
  });

  test('GET /foo/:bar', async () => {
    const bar = 'p1';
    const res = await Test.bunServer.buildRequest(`/foo/${bar}`).withMethod('GET').send();

    expect(res.status).toBe(200);
    expect(await res?.json?.()).toEqual({
      params: {
        bar,
      },
    });
  });

  test('GET /foo/:bar validation failure', async () => {
    const { status } = await Test.bunServer
      .buildRequest('/foo/long')
      .withMethod('GET')
      .send();

    expect(status).toBe(400);
  });

  test('POST /foo/:bar', async () => {
    const body = {
      foo: 'custom foo',
    };
    const res = await Test.bunServer
      .buildRequest('/foo/p1')
      .withMethod('POST')
      .withHeaders({
        'Content-Type': 'application/json',
      })
      .withBody(JSON.stringify(body))
      .send();

    expect(res.status).toBe(200);
    expect(await res?.json?.()).toEqual({
      params: {
        bar: 'p1',
      },
      rawBody: body,
      body: {
        foo: 'custom foo',
        bar: "I'm a bar",
      },
    });
  });

  test('POST /foo/:bar validation failure', async () => {
    const { status } = await Test.bunServer
      .buildRequest('/foo/long')
      .withMethod('POST')
      .withHeaders({
        'Content-Type': 'application/json',
      })
      .withBody(JSON.stringify({ foo: 'custom foo' }))
      .send();

    expect(status).toBe(400);
  });
});
