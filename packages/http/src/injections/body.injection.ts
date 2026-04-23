import type { ZodType } from 'zod';
import type { InjectionOptions, InjectionType } from './types';

export type Body<TSchema = unknown> = InjectionType<TSchema>;

export function Body(schema?: ZodType): InjectionOptions {
  return {
    token: Body,
    schema,
  };
}
