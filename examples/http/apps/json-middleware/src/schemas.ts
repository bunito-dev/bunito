import { z } from 'zod';

export const FooParams = z.object({
  bar: z.string().max(2),
});

export const FooBody = z.object({
  foo: z.string().default("I'm a foo"),
  bar: z.string().default("I'm a bar"),
});
