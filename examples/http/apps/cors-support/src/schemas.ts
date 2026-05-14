import { z } from 'zod';

export const BarParams = z.object({
  a: z.string().max(2),
  b: z.string(),
  c: z.string().toUpperCase(),
});

export const BarQuery = z.object({
  bar: z.string().default('bar'),
  baz: z.string().default('baz'),
});
