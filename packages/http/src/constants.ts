import type { HTTPErrorStatus } from './types';

export const HTTP_ERROR_STATUS_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};

export const HTTP_ERROR_STATUS_TEXT = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  NOT_IMPLEMENTED: 'Not Implemented',
} satisfies Record<HTTPErrorStatus, string>;

export const HTTP_CONTENT_TYPES = ['application/json', 'text/plain'] as const;
