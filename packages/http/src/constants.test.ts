import { describe, expect, it } from 'bun:test';
import {
  HTTP_CONTENT_TYPES,
  HTTP_ERROR_STATUS_CODES,
  HTTP_STATUS_MESSAGES,
  HTTP_SUCCESS_STATUS_CODES,
} from './constants';

describe('http constants', () => {
  it('should expose the expected status codes and content types', () => {
    expect(HTTP_SUCCESS_STATUS_CODES.OK).toBe(200);
    expect(HTTP_SUCCESS_STATUS_CODES.NO_CONTENT).toBe(204);
    expect(HTTP_ERROR_STATUS_CODES.BAD_REQUEST).toBe(400);
    expect(HTTP_ERROR_STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HTTP_STATUS_MESSAGES.NOT_IMPLEMENTED).toBe('Not Implemented');
    expect(HTTP_CONTENT_TYPES).toEqual(['application/json', 'text/plain']);
  });
});
