import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Body } from './body.injection';
import { Context } from './context.injection';
import { Method } from './method.injection';
import { Params } from './params.injection';
import { Query } from './query.injection';

describe('HTTP injections', () => {
  it('creates token injections for request context values', () => {
    const schema = z.object({
      id: z.string(),
    });

    expect(Context()).toEqual({
      useToken: Context,
    });
    expect(Method()).toEqual({
      useToken: Method,
    });
    expect(Params(schema)).toEqual({
      useToken: Params,
      options: schema,
    });
    expect(Query(schema)).toEqual({
      useToken: Query,
      options: schema,
    });
    expect(Body(schema)).toEqual({
      useToken: Body,
      options: schema,
    });
  });
});
