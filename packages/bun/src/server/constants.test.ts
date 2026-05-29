import { describe, expect, it } from 'bun:test';
import { Id } from '@bunito/container';
import { BUN_SERVER_FACTORY_ID, HTTP_METHODS } from './constants';

describe('server constants', () => {
  it('exports the server factory id and supported HTTP methods', () => {
    expect(BUN_SERVER_FACTORY_ID).toBeInstanceOf(Id);
    expect(BUN_SERVER_FACTORY_ID.toString()).toBe('SERVER_FACTORY_ID');
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
