import type { OnRequestSchema } from '@bunito/http';
import { z } from 'zod';

// Schemas can validate and coerce route input before it reaches the handler context.
export const GetDelayedSchema = z.object({
  params: z.object({
    delay: z.coerce.number().int().positive().max(1000),
  }),
}) satisfies OnRequestSchema;
