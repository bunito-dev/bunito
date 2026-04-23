import type { ZodType } from 'zod';

export type InjectionType<TSchema> = TSchema extends ZodType<infer T> ? T : TSchema;

export type InjectionOptions = {
  token: unknown;
  schema?: ZodType;
};
