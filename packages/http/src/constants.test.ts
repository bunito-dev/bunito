import { describe, expect, it } from 'bun:test';
import {
  HTTP_CONTENT_TYPES,
  HTTP_ERROR_STATUS_CODES,
  HTTP_ERROR_STATUS_TEXT,
} from './constants';

describe('HTTP constants', () => {
  it('maps supported error statuses and content types', () => {
    expect(HTTP_ERROR_STATUS_CODES).toEqual({
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      INTERNAL_SERVER_ERROR: 500,
      NOT_IMPLEMENTED: 501,
    });
    expect(HTTP_ERROR_STATUS_TEXT).toEqual({
      BAD_REQUEST: 'Bad Request',
      UNAUTHORIZED: 'Unauthorized',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Not Found',
      INTERNAL_SERVER_ERROR: 'Internal Server Error',
      NOT_IMPLEMENTED: 'Not Implemented',
    });
    expect(HTTP_CONTENT_TYPES).toEqual(['application/json', 'text/plain']);
  });
});
