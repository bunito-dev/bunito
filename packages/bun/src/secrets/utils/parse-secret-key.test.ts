import { describe, expect, it } from 'bun:test';
import { parseSecretKey } from './parse-secret-key';

describe('parseSecretKey', () => {
  it('parses service and name from a bun secret key', () => {
    expect(parseSecretKey('github.token')).toEqual({
      service: 'github',
      name: 'token',
    });
  });

  it('returns undefined or throws for invalid keys', () => {
    expect(parseSecretKey('invalid' as never, false)).toBeUndefined();
    expect(() => parseSecretKey('invalid' as never)).toThrow(
      'Invalid bun secret key: invalid. Expected format: <service>.<name>',
    );
  });
});
