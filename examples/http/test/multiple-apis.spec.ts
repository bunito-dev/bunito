import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { AppModule } from '@apps/multiple-apis';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

describe('multiple-apis', () => {
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

  test('GET /foo/:foo', async () => {
    const res = await Test.bunServer.buildRequest('/foo/a').withMethod('GET').send();

    expect(res.status).toBe(200);
    expect(await res.text?.()).toBe('foo: a');
  });

  test('GET /foo/:foo validation failure', async () => {
    const { status } = await Test.bunServer
      .buildRequest('/foo/long')
      .withMethod('GET')
      .send();

    expect(status).toBe(400);
  });

  test('GET /bar/:bar', async () => {
    const res = await Test.bunServer.buildRequest('/bar/b').withMethod('GET').send();

    expect(res.status).toBe(200);
    expect(await res.json?.()).toEqual({
      action: 'getBar',
      params: {
        bar: 'b',
      },
    });
  });

  test('GET /bar/:bar validation failure', async () => {
    const { status } = await Test.bunServer
      .buildRequest('/bar/long')
      .withMethod('GET')
      .send();

    expect(status).toBe(400);
  });

  test('GET /bar/*', async () => {
    const { status } = await Test.bunServer
      .buildRequest('/bar/missing/path')
      .withMethod('GET')
      .send();

    expect(status).toBe(404);
  });
});
