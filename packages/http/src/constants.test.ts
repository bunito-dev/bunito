import { describe, expect, it } from 'bun:test';
import {
  DYNAMIC_SEGMENT_ALIASES,
  DYNAMIC_SEGMENT_KEYS,
  HTTP_CONTENT_TYPES,
  HTTP_CONTROLLER,
  HTTP_ERROR_STATUS_CODES,
  HTTP_STATUS_MESSAGES,
  HTTP_SUCCESS_STATUS_CODES,
} from './constants';

describe('HTTP_SUCCESS_STATUS_CODES', () => {
  it('exposes the supported success statuses', () => {
    expect(HTTP_SUCCESS_STATUS_CODES).toEqual({
      CONTINUE: 100,
      OK: 200,
      CREATED: 201,
      ACCEPTED: 202,
      NO_CONTENT: 204,
    });
  });
});

describe('HTTP_ERROR_STATUS_CODES', () => {
  it('exposes the supported error statuses', () => {
    expect(HTTP_ERROR_STATUS_CODES).toEqual({
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      METHOD_NOT_ALLOWED: 405,
      INTERNAL_SERVER_ERROR: 500,
      NOT_IMPLEMENTED: 501,
      SERVICE_UNAVAILABLE: 503,
      GATEWAY_TIMEOUT: 504,
    });
  });
});

describe('HTTP_STATUS_MESSAGES', () => {
  it('maps statuses to human readable messages', () => {
    expect(HTTP_STATUS_MESSAGES.NOT_FOUND).toBe('Not Found');
    expect(HTTP_STATUS_MESSAGES.INTERNAL_SERVER_ERROR).toBe('Internal Server Error');
  });
});

describe('HTTP_CONTENT_TYPES', () => {
  it('lists supported default response types', () => {
    expect(HTTP_CONTENT_TYPES).toEqual(['application/json', 'text/plain']);
  });
});

describe('HTTP_CONTROLLER', () => {
  it('uses a symbol token for controller components', () => {
    expect(HTTP_CONTROLLER).toBeSymbol();
  });
});

describe('DYNAMIC_SEGMENT_ALIASES', () => {
  it('maps route segment kinds to their route aliases', () => {
    expect(DYNAMIC_SEGMENT_ALIASES).toEqual({
      param: ':',
      any: '*',
      wildcard: '**',
    });
  });
});

describe('DYNAMIC_SEGMENT_KEYS', () => {
  it('contains aliases in declaration order', () => {
    expect(DYNAMIC_SEGMENT_KEYS).toEqual([':', '*', '**']);
  });
});
