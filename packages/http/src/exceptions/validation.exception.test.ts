import { describe, expect, it } from 'bun:test';
import { ZodError } from 'zod';
import { ValidationException } from './validation.exception';

describe('ValidationException', () => {
  describe('fromZodError', () => {
    it('builds a bad request exception from zod issues', () => {
      const exception = ValidationException.fromZodError(new ZodError([]));

      expect(exception.name).toBe('ValidationException');
      expect(exception.status).toBe('BAD_REQUEST');
      expect(exception.toJSON()).toEqual({
        issues: [],
      });
    });
  });
});
