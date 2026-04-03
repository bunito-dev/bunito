import type { HttpStatus } from './types';

export const DECORATOR_METADATA_KEYS = {
  path: Symbol('http(path)'),
  request: Symbol('http(request)'),
  response: Symbol('http(response)'),
} as const satisfies Record<string, symbol>;

export const HTTP_SUCCESS_STATUS_CODES = {
  continue: 100,
  ok: 200,
  created: 201,
  accepted: 202,
  noContent: 204,
} as const satisfies Record<string, number>;

export const HTTP_ERROR_STATUS_CODES = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  internalServerError: 500,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
} as const satisfies Record<string, number>;

export const HTTP_STATUS_MESSAGES = {
  continue: 'Continue',
  ok: 'OK',
  created: 'Created',
  accepted: 'Accepted',
  noContent: 'No Content',
  badRequest: 'Bad Request',
  unauthorized: 'Unauthorized',
  forbidden: 'Forbidden',
  notFound: 'Not Found',
  methodNotAllowed: 'Method Not Allowed',
  internalServerError: 'Internal Server Error',
  serviceUnavailable: 'Service Unavailable',
  gatewayTimeout: 'Gateway Timeout',
} as const satisfies Record<HttpStatus, string>;

export const HTTP_CONTENT_TYPES = {
  json: 'application/json',
  text: 'text/plain',
} as const satisfies Record<string, string>;
