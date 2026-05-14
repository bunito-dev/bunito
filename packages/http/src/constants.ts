import { HTTP_METHODS } from '@bunito/bun/internals';
import type { HTTPErrorStatus, HTTPMethod } from './types';

export const HTTP_CONTROLLER_KEY = Symbol('http');

export const HTTP_SUCCESS_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
} as const;

export const HTTP_ERROR_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
} as const;

export const HTTP_ERROR_STATUS_TEXT = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  NOT_IMPLEMENTED: 'Not Implemented',
} satisfies Record<HTTPErrorStatus, string>;

export const HTTP_HEADER_NAMES = [
  'Accept',
  'Access-Control-Allow-Credentials',
  'Access-Control-Allow-Methods',
  'Access-Control-Allow-Origin',
  'Access-Control-Expose-Headers',
  'Access-Control-Max-Age',
  'Cache-Control',
  'Content-Type',
  'Set-Cookie',
  'Vary',
] as const;

export const HTTP_CONTENT_TYPES = ['application/json', 'text/plain'] as const;

export const HTTP_ALL_METHODS = HTTP_METHODS.filter(
  (method) => method !== 'OPTIONS',
) as HTTPMethod[];
