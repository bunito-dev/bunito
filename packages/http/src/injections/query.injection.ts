import type { ZodObject } from 'zod';
import type { RouteInjection } from '../types';

export type Query<TSchema extends Record<string, unknown> = Record<string, string>> =
  TSchema;

export function Query(schema?: ZodObject): RouteInjection {
  return {
    token: Query,
    schema,
  };
}
