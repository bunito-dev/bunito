import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { Method } from './method.injection';

describe('Method', () => {
  it('creates method injection options', () => {
    const schema = z.string();

    expect(Method(schema)).toEqual({
      token: Method,
      schema,
    });
  });
});
