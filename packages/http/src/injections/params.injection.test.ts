import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Params } from './params.injection';

describe('Params', () => {
  it('creates a params injection token with optional schema options', () => {
    const schema = z.object({
      id: z.string(),
    });

    expect(Params(schema)).toEqual({
      useToken: Params,
      options: schema,
    });
  });
});
