import { describe, expect, it } from 'bun:test';
import { HttpException } from './http.exception';

describe('HttpException', () => {
  it('should capture an existing HttpException unchanged', () => {
    const error = new HttpException(404);

    expect(HttpException.capture(error)).toBe(error);
  });

  it('should capture unknown errors as a 500 response error', () => {
    const cause = new Error('boom');
    const error = HttpException.capture(cause);

    expect(error.status).toBe(500);
    expect(error.message).toBe('Internal Server Error');
    expect(error.cause).toBe(cause);
  });

  it('should serialize error messages when no data is provided', async () => {
    const response = new HttpException(404).toResponse();

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: 'Not Found',
    });
  });

  it('should serialize raw data when data is provided', async () => {
    const response = new HttpException(400, {
      field: 'invalid',
    }).toResponse();

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      field: 'invalid',
    });
  });
});
