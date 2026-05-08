import { z } from 'zod';

export const FooParams = z.object({
  foo: z.string().max(2),
});
