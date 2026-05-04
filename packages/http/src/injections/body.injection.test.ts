import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Body } from './body.injection';

describe('Body', () => {
  it('creates a body injection token with optional schema options', () => {
    const schema = z.object({
      id: z.string(),
    });

    expect(Body(schema)).toEqual({
      useToken: Body,
      options: schema,
    });
  });
});
