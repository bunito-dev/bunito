import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Query } from './query.injection';

describe('Query', () => {
  it('creates query injection options', () => {
    const schema = z.object({
      search: z.string(),
    });

    expect(Query(schema)).toEqual({
      token: Query,
      schema,
    });
  });
});
