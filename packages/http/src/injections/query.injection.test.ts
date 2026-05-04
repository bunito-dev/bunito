import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Query } from './query.injection';

describe('Query', () => {
  it('creates a query injection token with optional schema options', () => {
    const schema = z.object({
      id: z.string(),
    });

    expect(Query(schema)).toEqual({
      useToken: Query,
      options: schema,
    });
  });
});
