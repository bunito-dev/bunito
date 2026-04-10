import type { z } from 'zod';

export type UnwrapZodType<TValue> = TValue extends z.ZodType ? z.infer<TValue> : TValue;
