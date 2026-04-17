import type { OnRequestSchema } from '@bunito/http';
import { z } from 'zod';

export const ValidSchema = z.object({
  body: z.object({
    foo: z.string().default('no bar'),
  }),
}) satisfies OnRequestSchema;
