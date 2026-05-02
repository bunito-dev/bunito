import { describe, expect, it } from 'bun:test';
import { ConfigException } from './config.exception';

describe('ConfigException', () => {
  it('uses a config-specific exception name', () => {
    const error = new ConfigException('Invalid config');

    expect(error.name).toBe('ConfigException');
    expect(error.message).toBe('Invalid config');
  });
});
