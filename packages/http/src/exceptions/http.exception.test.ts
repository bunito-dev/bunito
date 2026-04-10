import { describe, expect, it } from 'bun:test';
import { ZodError } from 'zod';
import { HttpException, ValidationException } from './index';

describe('HttpException', () => {
  it('should capture existing http exceptions and wrap unknown errors', () => {
    const existing = new HttpException('NOT_FOUND');
    const wrapped = HttpException.capture(new Error('boom'));

    expect(HttpException.capture(existing)).toBe(existing);
    expect(wrapped.status).toBe('INTERNAL_SERVER_ERROR');
    expect(wrapped.cause).toBeInstanceOf(Error);
  });

  it('should resolve messages, status codes and json output', () => {
    const withString = new HttpException('NOT_FOUND', 'Missing');
    const withData = new HttpException('BAD_REQUEST', {
      data: {
        field: 'name',
      },
    });
    const withPrimitive = new HttpException('BAD_REQUEST', {
      data: 'invalid' as never,
    });

    expect(withString.message).toBe('Missing');
    expect(withString.statusCode).toBe(404);
    expect(withData.toJSON()).toEqual({
      field: 'name',
    });
    expect(withPrimitive.toJSON()).toEqual({
      error: 'Bad Request',
      data: 'invalid',
    });
  });
});

describe('ValidationException', () => {
  it('should expose bad request validation errors', () => {
    const exception = new ValidationException({
      foo: 'bar',
    });
    const zodError = new ZodError([
      {
        code: 'custom',
        message: 'broken',
        path: ['query', 'id'],
      },
    ]);

    expect(exception.name).toBe('ValidationException');
    expect(exception.status).toBe('BAD_REQUEST');
    expect(exception.message).toBe('Validation failed');
    expect(ValidationException.fromZodError(zodError).data).toEqual({
      issues: zodError.issues,
    });
  });
});
