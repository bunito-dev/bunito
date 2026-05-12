import { describe, expect, it } from 'bun:test';
import { Exception } from './exception';

describe('Exception', () => {
  it('stores a message with printable detail arguments', () => {
    const error = new Exception(['Project failed', 'apps/api', 'package.json']);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Project failed');
    expect(error.description).toEqual(['apps/api', 'package.json']);
  });
});
