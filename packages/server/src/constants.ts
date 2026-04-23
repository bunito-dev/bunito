import { Id } from '@bunito/container';
import type { HttpErrorStatus, HttpMethod } from './types';

export const SERVER_FACTORY_ID = Id.for('SERVER_FACTORY');

export const SERVER_EXTENSION = Symbol('server(EXTENSION)');

export const HTTP_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'OPTIONS',
  'PATCH',
] as const satisfies readonly HttpMethod[];

export const HTTP_ERROR_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  UPGRADE_REQUIRED: 426,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const HTTP_ERROR_STATUS_MAP = new Map<number, HttpErrorStatus>(
  Object.entries(HTTP_ERROR_STATUS_CODES).map(([alias, key]) => [
    key,
    alias as HttpErrorStatus,
  ]),
);

export const HTTP_ERROR_STATUS_MESSAGES = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  PAYMENT_REQUIRED: 'Payment Required',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  METHOD_NOT_ALLOWED: 'Method Not Allowed',
  REQUEST_TIMEOUT: 'Request Timeout',
  CONFLICT: 'Conflict',
  UPGRADE_REQUIRED: 'Upgrade Required',
  TOO_MANY_REQUESTS: 'Too Many Requests',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  NOT_IMPLEMENTED: 'Not Implemented',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
  GATEWAY_TIMEOUT: 'Gateway Timeout',
} as const satisfies Record<HttpErrorStatus, string>;
