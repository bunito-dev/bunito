import { describe, expect, it } from 'bun:test';
import {
  HTTP_ERROR_STATUS_CODES,
  HTTP_ERROR_STATUS_MAP,
  HTTP_ERROR_STATUS_MESSAGES,
  HTTP_METHODS,
  SERVER_EXTENSION,
  SERVER_FACTORY_ID,
} from './constants';

describe('server constants', () => {
  it('exposes stable server ids, methods, and error maps', () => {
    expect(`${SERVER_FACTORY_ID}`).toContain('SERVER_FACTORY');
    expect(SERVER_EXTENSION).toBeSymbol();
    expect(HTTP_METHODS).toContain('GET');
    expect(HTTP_ERROR_STATUS_CODES.NOT_FOUND).toBe(404);
    expect(HTTP_ERROR_STATUS_MAP.get(404)).toBe('NOT_FOUND');
    expect(HTTP_ERROR_STATUS_MESSAGES.NOT_FOUND).toBe('Not Found');
  });
});
