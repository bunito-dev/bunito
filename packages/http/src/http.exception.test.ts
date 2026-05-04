import { describe, expect, it } from 'bun:test';
import { HTTPException } from './http.exception';

describe('HTTPException', () => {
  it('creates JSON and text responses for known status keys', async () => {
    const error = new HTTPException('BAD_REQUEST');
    const json = error.toResponse();
    const text = error.toResponse('text/plain');

    expect(error.name).toBe('HTTPException');
    expect(error.statusCode).toBe(400);
    expect(error.toJSON()).toEqual({
      error: 'Bad Request',
    });
    expect(json.status).toBe(400);
    expect(await json.json()).toEqual({
      error: 'Bad Request',
    });
    expect(text.status).toBe(400);
    expect(await text.text()).toBe('Bad Request');
  });

  it('supports custom numeric status codes and data payloads', async () => {
    const error = new HTTPException(418, "I'm a teapot", {
      code: 'teapot',
    });
    const response = error.toResponse();

    expect(error.statusCode).toBe(418);
    expect(error.toJSON()).toEqual({
      code: 'teapot',
    });
    expect(response.status).toBe(418);
    expect(await response.json()).toEqual({
      code: 'teapot',
    });
  });
});
