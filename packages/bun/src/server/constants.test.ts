import { describe, expect, it } from 'bun:test';
import { Id } from '@bunito/container/internals';
import { HTTP_METHODS, SERVER_FACTORY_ID } from './constants';

describe('server constants', () => {
  it('exports the server factory id and supported HTTP methods', () => {
    expect(SERVER_FACTORY_ID).toBeInstanceOf(Id);
    expect(SERVER_FACTORY_ID.toString()).toBe('SERVER_FACTORY_ID');
    expect(HTTP_METHODS).toEqual([
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'HEAD',
      'OPTIONS',
    ]);
  });
});
