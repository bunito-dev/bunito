import { describe, expect, it } from 'bun:test';
import { HTTP_CONTROLLER_METADATA_KEYS, HTTP_STATUS_MESSAGES } from './constants';

describe('http constants', () => {
  it('should expose controller metadata keys as symbols', () => {
    expect(typeof HTTP_CONTROLLER_METADATA_KEYS.path).toBe('symbol');
    expect(typeof HTTP_CONTROLLER_METADATA_KEYS.methods).toBe('symbol');
  });

  it('should expose known HTTP status messages', () => {
    expect(HTTP_STATUS_MESSAGES[200]).toBe('OK');
    expect(HTTP_STATUS_MESSAGES[404]).toBe('Not Found');
    expect(HTTP_STATUS_MESSAGES[500]).toBe('Internal Server Error');
    expect(HTTP_STATUS_MESSAGES[1000]).toBe('Unknown Error');
  });
});
