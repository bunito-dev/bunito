import type { ZodObject } from 'zod';
import type { RouteInjection } from '../types';

export type Params<TSchema extends Record<string, unknown> = Record<string, string>> =
  TSchema;

export function Params(schema?: ZodObject): RouteInjection {
  return {
    token: Params,
    schema,
  };
}
