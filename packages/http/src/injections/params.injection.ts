import type { ZodObject } from 'zod';
import type { InjectionOptions, InjectionType } from './types';

export type Params<
  TSchema extends Record<string, unknown> | ZodObject = Record<string, string>,
> = InjectionType<TSchema>;

export function Params(schema?: ZodObject): InjectionOptions {
  return {
    token: Params,
    schema,
  };
}
