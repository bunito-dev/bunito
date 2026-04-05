import type { HttpStatus } from './types';

export const HTTP_SUCCESS_STATUS_CODES = {
  CONTINUE: 100,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
} as const satisfies Record<string, number>;

export const HTTP_ERROR_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const satisfies Record<string, number>;

export const HTTP_STATUS_MESSAGES = {
  CONTINUE: 'Continue',
  OK: 'OK',
  CREATED: 'Created',
  ACCEPTED: 'Accepted',
  NO_CONTENT: 'No Content',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  METHOD_NOT_ALLOWED: 'Method Not Allowed',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
  GATEWAY_TIMEOUT: 'Gateway Timeout',
} as const satisfies Record<HttpStatus, string>;
