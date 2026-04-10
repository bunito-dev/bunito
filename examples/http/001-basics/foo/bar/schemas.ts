import type { OnRequestSchema } from '@bunito/http';
import { z } from 'zod';

export const BarSchema = z.object({
  params: z.object({
    delay: z.coerce.number().int().positive().max(1000),
  }),
}) satisfies OnRequestSchema;
