import { describe, expect, it } from 'bun:test';
import { ConfigurationException } from './configuration.exception';

describe('ConfigurationException', () => {
  it('sets the expected error name', () => {
    expect(new ConfigurationException('Config').name).toBe('ConfigurationException');
  });
});
