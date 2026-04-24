import type { HttpMethod } from '@bunito/server';
import type { ZodString } from 'zod';
import type { InjectionOptions } from './types';

export type Method = HttpMethod;

export function Method(schema?: ZodString): InjectionOptions {
  return {
    token: Method,
    schema,
  };
}
