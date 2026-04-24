import { describe, expect, it } from 'bun:test';
import { HttpException } from './http.exception';

describe('HttpException', () => {
  it('resolves named and numeric HTTP errors', async () => {
    const named = new HttpException('NOT_FOUND');
    const numeric = new HttpException(418, 'Teapot', { code: 'teapot' });

    expect(named.name).toBe('HttpException');
    expect(named.status).toBe(404);
    expect(named.message).toBe('Not Found');
    expect(numeric.status).toBe(418);
    expect(numeric.message).toBe('Teapot');
    expect(numeric.data).toEqual({ code: 'teapot' });
    expect(await numeric.toResponse().text()).toBe('Teapot');
    expect(numeric.toResponse().headers.get('Content-Type')).toBe('text/plain');
  });

  it('uses a fallback message for unknown numeric statuses', () => {
    expect(new HttpException(599).message).toBe('Unexpected Error');
  });
});
