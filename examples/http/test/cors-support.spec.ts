import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { AppModule } from '@apps/cors-support';
import { App } from '@bunito/bunito';
import { HTTPModule } from '@bunito/http';
import { Test } from '@bunito/testing';

describe('cors-support', () => {
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
    expect(headers?.get('Vary')).toBe('Origin');
    expect(headers?.get('Access-Control-Max-Age')).toBe('3600');
    expect(headers?.get('Access-Control-Allow-Credentials')).toBe('false');
    expect(headers?.get('Access-Control-Allow-Origin')).toBe('*');
    expect(headers?.get('Access-control-Allow-Methods')).toBe('GET');
    expect(headers?.get('Access-control-Allow-Headers')).toBe(
      'Content-Type, Authorization',
    );
  });

  test('GET /foo', async () => {
    const { status, headers } = await Test.bunServer
      .buildRequest('/foo')
      .withMethod('GET')
      .send();

    expect(status).toBe(200);
    expect(headers?.get('Vary')).toBe('Origin');
    expect(headers?.get('Access-Control-Allow-Credentials')).toBe('false');
    expect(headers?.get('Access-Control-Allow-Origin')).toBe('*');
  });

  test('OPTIONS /foo/bar', async () => {
    const { status, headers } = await Test.bunServer
      .buildRequest('/foo/bar')
      .withMethod('OPTIONS')
      .send();

    expect(status).toBe(204);
    expect(headers?.get('Accept')).toBe('GET, POST, PUT, DELETE, PATCH, HEAD');
    expect(headers?.get('Vary')).toBe('Origin');
    expect(headers?.get('Access-Control-Max-Age')).toBe('3600');
    expect(headers?.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(headers?.get('Access-Control-Allow-Origin')).toBe('*');
    expect(headers?.get('Access-Control-Allow-Methods')).toBe('GET, POST');
    expect(headers?.get('Access-control-Allow-Headers')).toBe(
      'Content-Type, Authorization',
    );
  });

  test('GET /foo/bar', async () => {
    const { status, headers } = await Test.bunServer
      .buildRequest('/foo/bar') //
      .withMethod('GET')
      .send();

    expect(status).toBe(200);
    expect(headers?.get('Vary')).toBe('Origin');
    expect(headers?.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(headers?.get('Access-Control-Allow-Origin')).toBe('*');
  });

  test('POST /foo/bar', async () => {
    const { status, headers } = await Test.bunServer
      .buildRequest('/foo/bar') //
      .withMethod('POST')
      .send();

    expect(status).toBe(200);
    expect(headers?.get('Vary')).toBe('Origin');
    expect(headers?.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(headers?.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
