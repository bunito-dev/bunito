import { describe, expect, it } from 'bun:test';
import { ServerException } from './server.exception';

describe('ServerException', () => {
  it('uses a server-specific exception name', () => {
    const error = new ServerException('Invalid server');

    expect(error.name).toBe('ServerException');
    expect(error.message).toBe('Invalid server');
  });
});
