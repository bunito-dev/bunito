import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Body } from './body.injection';

describe('Body', () => {
  it('creates body injection options', () => {
    const schema = z.object({
      name: z.string(),
    });

    expect(Body(schema)).toEqual({
      token: Body,
      schema,
    });
  });
});
