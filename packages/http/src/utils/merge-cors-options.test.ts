import { describe, expect, it } from 'bun:test';
import { mergeCorsOptions } from './merge-cors-options';

describe('mergeCorsOptions', () => {
  it('returns undefined when both CORS option sets are missing', () => {
    expect(mergeCorsOptions(undefined, undefined)).toBeUndefined();
  });

  it('returns the available CORS option set when only one side is defined', () => {
    const current = {
      origin: 'https://current.example.com',
    };
    const options = {
      origin: 'https://next.example.com',
    };

    expect(mergeCorsOptions(current, undefined)).toBe(current);
    expect(mergeCorsOptions(undefined, options)).toBe(options);
  });

  it('merges CORS option sets with the next options taking precedence', () => {
    expect(
      mergeCorsOptions(
        {
          origin: 'https://current.example.com',
          credentials: true,
        },
        {
          origin: 'https://next.example.com',
          maxAge: 60,
        },
      ),
    ).toEqual({
      origin: 'https://next.example.com',
      credentials: true,
      maxAge: 60,
    });
  });
});
