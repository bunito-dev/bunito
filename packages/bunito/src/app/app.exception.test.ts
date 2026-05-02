import { describe, expect, it } from 'bun:test';
import { AppException } from './app.exception';

describe('AppException', () => {
  it('uses an app-specific exception name', () => {
    const error = new AppException('Invalid app');

    expect(error.name).toBe('AppException');
    expect(error.message).toBe('Invalid app');
  });
});
