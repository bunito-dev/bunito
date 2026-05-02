import { describe, expect, it } from 'bun:test';
import { SecretsException } from './secrets.exception';

describe('SecretsException', () => {
  it('uses a secrets-specific exception name', () => {
    const error = new SecretsException('Invalid secret');

    expect(error.name).toBe('SecretsException');
    expect(error.message).toBe('Invalid secret');
  });
});
