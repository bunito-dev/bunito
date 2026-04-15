import { describe, expect, it } from 'bun:test';
import { HttpException } from './http.exception';

describe('HttpException', () => {
  describe('capture', () => {
    it('returns existing http exceptions and wraps unknown errors', () => {
      const exception = new HttpException('NOT_FOUND');

      expect(HttpException.capture(exception)).toBe(exception);
      expect(HttpException.capture(new Error('boom'))).toMatchObject({
        status: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
      });
    });
  });

  describe('statusCode', () => {
    it('maps the status enum to its numeric code', () => {
      expect(new HttpException('NOT_FOUND').statusCode).toBe(404);
    });
  });

  describe('toJSON', () => {
    it('returns data objects directly and wraps non-object payloads', () => {
      expect(
        new HttpException('BAD_REQUEST', {
          data: {
            issues: [],
          },
        }).toJSON(),
      ).toEqual({
        issues: [],
      });

      expect(new HttpException('NOT_FOUND').toJSON()).toEqual({
        error: 'Not Found',
        data: undefined,
      });
    });
  });
});
