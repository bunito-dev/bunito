import { describe, expect, it } from 'bun:test';
import { JSON_CONTENT_TYPE } from './constants';

describe('JSON_CONTENT_TYPE', () => {
  it('uses the application/json media type', () => {
    expect(JSON_CONTENT_TYPE).toBe('application/json');
  });
});
