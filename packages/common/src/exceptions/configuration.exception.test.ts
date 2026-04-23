import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from './configuration.exception';

describe('ConfigurationException', () => {
  it('sets the expected error name', () => {
    expect(new ConfigurationException('Config').name).toBe('ConfigurationException');
  });

  it('throw static method throws ConfigurationException', () => {
    expect(() => ConfigurationException.throw`Config error`).toThrow(
      ConfigurationException,
    );
  });

  it('reject static method rejects with ConfigurationException', () => {
    expect(ConfigurationException.reject`Config error`).rejects.toBeInstanceOf(
      ConfigurationException,
    );
  });
});
