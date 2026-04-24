import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Params } from './params.injection';

describe('Params', () => {
  it('creates params injection options', () => {
    const schema = z.object({
      id: z.string(),
    });

    expect(Params(schema)).toEqual({
      token: Params,
      schema,
    });
  });
});
