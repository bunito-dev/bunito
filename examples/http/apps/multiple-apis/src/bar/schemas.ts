import { z } from 'zod';

export const BarParams = z.object({
  bar: z.string().max(2),
});
