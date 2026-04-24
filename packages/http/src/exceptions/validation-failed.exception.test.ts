import { describe, expect, it } from 'bun:test';
import { ValidationFailedException } from './validation-failed.exception';

describe('ValidationFailedException', () => {
  it('creates a validation-specific bad request exception', () => {
    const exception = new ValidationFailedException({ errors: [] });

    expect(exception.status).toBe(400);
    expect(exception.message).toBe('Validation Failed');
    expect(exception.data).toEqual({ errors: [] });
  });
});
