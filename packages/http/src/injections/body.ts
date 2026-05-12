import type { InjectionTokenOptions } from '@bunito/container/internals';
import type { ZodType, z } from 'zod';

export type Body<TOptions = unknown> = TOptions extends ZodType
  ? z.infer<TOptions>
  : TOptions;

export function Body(options?: ZodType): InjectionTokenOptions {
  return {
    useToken: Body,
    options,
  };
}
