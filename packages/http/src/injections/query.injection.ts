import type { ZodObject } from 'zod';
import type { InjectionOptions, InjectionType } from './types';

export type Query<
  TSchema extends Record<string, unknown> | ZodObject = Record<string, string>,
> = InjectionType<TSchema>;

export function Query(schema?: ZodObject): InjectionOptions {
  return {
    token: Query,
    schema,
  };
}
